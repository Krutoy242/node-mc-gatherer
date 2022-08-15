import { sortBy } from 'lodash'
import type { Ingredient } from './Ingredient'
import Playthrough from './Playthrough'
import { Stack } from './Stack'

import { solverLoop } from './SolverLoop'
import type { Calculable, Identified, Solvable, SolvableRecipe } from '.'

type Tail<T extends any[]> = T extends [any, ...infer Part] ? Part : never

type ScendTail = Tail<Required<Parameters<ReturnType<(typeof descending | typeof ascending)>>>>
export function solveLog<
  T extends Solvable<T>,
  U extends readonly any[]
>(
  topDef: T,
  logDefaultArgs: U,
  log: (
    def: T,
    combined: (readonly [T, ...ScendTail])[] | undefined,
    ...args: [...ScendTail, ...U]
  ) => U | undefined,
  isAscend?: boolean
) {
  const playthrough = new Playthrough<T>()
  const further = (isAscend ? ascending : descending)(playthrough)
  playthrough.addInputs([new Stack(topDef)], 1)

  solverLoop(
    (def: T, ...args) => {
      const combined = further(def, ...args)
      // @ts-expect-error TS cant in rest
      const logArgs = log(def, combined, ...args)

      return combined?.map(ms => [...ms, ...logArgs as U] as const)
    }
  )(topDef, undefined, ...logDefaultArgs)

  return playthrough
}

export function solve<T extends Solvable<T>>(
  topDef: T,
  isAscend?: boolean
) {
  const playthrough = new Playthrough<T>()
  const further = (isAscend ? ascending : descending)(playthrough)
  playthrough.addInputs([new Stack(topDef)], 1)

  solverLoop<T, any[]>(further)(topDef)

  return playthrough
}

function descending<T extends Solvable<T>>(playthrough: Playthrough<T>) {
  return (def: T, amount = 1) => {
    if (!def.recipes?.size) return // No recipes

    const recipe = def.mainRecipe ?? [...def.recipes].sort(recipeSorter)[0]

    recipe.catalystsDef ??= toDefStacks(recipe.catalysts)
    recipe.inputsDef ??= toDefStacks(recipe.inputs)

    playthrough.addCatalysts(recipe.catalystsDef)
    playthrough.addInputs(recipe.inputsDef, amount)

    return [
      recipe.catalystsDef,
      recipe.inputsDef?.map(ms => ({
        it    : ms.it,
        amount: amount / (ms.it.mainRecipeAmount ?? 1) * (ms.amount ?? 1),
      })),
    ].flat().map(ms =>
      [ms.it, ms.amount ?? 1] as const
    )
  }
}

function ascending<T extends Solvable<T>>(playthrough: Playthrough<T>) {
  return (def: T, behind = new Set<Stack<T>>()) => {
    if (!def.dependencies?.size) return undefined
    const defStack = new Stack(def)

    const result = [...def.dependencies].map((r) => {
      // List of outputs of this recipe
      // Filter only recipes that have item as requirment in main recipe
      const ds = toDefStacks(r.outputs).filter(s => s.it.mainRecipe?.requirments
        .some(st => st.it.items.includes(def))
      )

      if (!ds.length) return []

      // Amount of current item as input
      const amount = r.requirments.find(s => s.it.items.includes(def))?.amount ?? 1

      // For each output, purchase everything behind
      const newBehind = new Set<Stack<T>>()
      ds.forEach((d) => {
        const mult = d.amount ?? 1 * amount
        playthrough.addInputs([defStack], mult)
        behind.forEach((st) => {
          playthrough.addInputs([st], mult)
          newBehind.add(new Stack(st.it, st.amount ?? 1 * mult))
        })
      })

      return ds.map(d => [d.it, newBehind] as const)
    }).flat()

    return sortBy(result, o => -o[0].complexity)
  }
}

function recipeSorter<T extends Solvable<T>>(a: SolvableRecipe<T>, b: SolvableRecipe<T>): number {
  return sortCheapest(a, b) || reqPuritySumm(b) - reqPuritySumm(a)
}

function sortCheapest(a: Calculable, b: Calculable): number {
  return b.purity - a.purity || a.complexity - b.complexity
}

function reqPuritySumm<T extends Solvable<T>>(a: SolvableRecipe<T>): number {
  return puritySumm(a.inputs) + puritySumm(a.catalysts)
}

function puritySumm<T extends Solvable<T>>(arr?: Stack<Ingredient<T>>[]): number {
  if (!arr) return 0
  return arr.reduce(
    (c, d) => c + Math.max(...[...d.it.matchedBy()].map(o => o.purity)),
    0
  )
}

function toDefStacks<T extends Identified & Calculable>(
  stacks?: Stack<Ingredient<T>>[]
): Stack<T>[] | [] {
  if (!stacks) return []
  return stacks
    .map(({ it, amount }) => [getCheapest(it), amount] as const)
    .filter((v): v is [T, number | undefined] => !!v[0])
    .map(([it, amount]) => new Stack<T>(it, amount))
    .sort(expensiveSort)
}

function getCheapest<T extends Identified & Calculable>(
  ingredient: Ingredient<T>
): T | undefined {
  return [...ingredient.matchedBy()].sort(cheapestSort)[0]
}

function cheapestSort(a: Calculable, b: Calculable) {
  return b.purity - a.purity || a.complexity - b.complexity
}

function expensiveSort(a: Stack<Calculable>, b: Stack<Calculable>) {
  return b.it.complexity - a.it.complexity
}
