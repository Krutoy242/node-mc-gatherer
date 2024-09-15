import type { Calculable, Identified, IngrAmount, SolvableRecipe } from '.'
import type { Ingredient } from './Ingredient'
import type Solvable from './Solvable'
import { sortBy } from '../lib/utils'

import Playthrough from './Playthrough'
import { solverLoop } from './SolverLoop'
import { Stack } from './Stack'

type Tail<T extends any[]> = T extends [any, ...infer Part] ? Part : never

type ScendTail = Tail<Required<Parameters<ReturnType<(typeof descending | typeof ascending)>>>>

type SolvableReciped = Solvable<SolvableRecipe<any>>

export function solve<
  T extends SolvableReciped,
  U extends readonly any[],
>(
  topDef: T,
  isAscend: boolean,
  log?: (
    def: T,
    combined: (readonly [T, ...ScendTail])[] | undefined,
    ...args: [...ScendTail, ...U]
  ) => U | undefined,
  logDefaultArgs?: U,
  playthrough = new Playthrough<T>(),
) {
  const further = (isAscend ? ascending : descending)(playthrough)
  playthrough.addCatalysts([new Stack(topDef)])

  solverLoop<T, any[]>(
    (def: T, ...args) => {
      const nextList = further(def, ...args)
      // @ts-expect-error TS cant in rest
      const logArgs = log ? log(def, nextList, ...args) : []

      return nextList?.map(ms => [...ms, ...(logArgs ?? [])] as const)
    },
  )(topDef, undefined, ...(logDefaultArgs ?? []))

  return playthrough
}

type PseudoStack<T> = readonly [T, number]

function descending<T extends SolvableReciped>(playthrough: Playthrough<SolvableReciped>) {
  return (currentSolvable: T, amount = 1) => {
    const tuple = currentSolvable.bestRecipe(amount)
    if (!tuple)
      return // No recipes

    const [recipe, outputAmount] = tuple
    const catalystsDef = toDefStacks(1, recipe.catalysts)
    const inputsDef = toDefStacks(amount, recipe.inputs)

    playthrough.addCatalysts(catalystsDef)
    playthrough.addInputs(inputsDef, amount)

    // Collection of defs should be walked next
    return [
      ...catalystsDef.map(ms => [ms.it, ms.amount ?? 1] as const),
      ...inputsDef.map(ms => [
        ms.it,
        amount / (outputAmount ?? 1) * (ms.amount ?? 1),
      ] as const),
    ] as PseudoStack<T>[]
  }
}

function ascending<T extends SolvableReciped>(playthrough: Playthrough<T>) {
  return (currentSolvable: T, behind = new Set<Stack<T>>()) => {
    if (!currentSolvable?.dependencies?.size)
      return undefined

    const defStack = new Stack(currentSolvable)

    const result = [...currentSolvable.dependencies].map((r) => {
      const outputsDef = toDefStacks(1, r.outputs)

      // List of outputs of this recipe
      const ds = outputsDef.filter(s => toDefStacks(s.amount ?? 1, s.it.bestRecipe()?.[0]?.requirments)
        ?.some(st => st.it === currentSolvable),
      )

      if (!ds.length)
        return []

      // Amount of current item as input
      const amount = r.requirments.find(s => s.it.items.includes(currentSolvable))?.amount ?? 1

      // For each output, purchase everything behind
      const newBehind = new Set<Stack<T>>()
      ds.forEach((d) => {
        const mult = (d.amount ?? 1) * amount
        playthrough.addInputs([defStack], mult)
        behind.forEach((st) => {
          playthrough.addInputs([st], mult)
          newBehind.add(new Stack(st.it, (st.amount ?? 1) * mult))
        })
      })

      return ds.map(d => [d.it, newBehind] as const)
    }).flat()

    return sortBy(result, o => -o[0].complexity)
  }
}

export function toDefStacks<T extends Identified & Calculable>(
  recipeAmount: number,
  stacks?: Stack<Ingredient<T>>[],
): Stack<T>[] | [] {
  if (!stacks)
    return []

  const sorter = expensiveSort(recipeAmount)
  return stacks
    .map(({ it, amount }) => [getCheapest(recipeAmount, it), amount] as const)
    .filter((v): v is [T, IngrAmount] => !!v[0])
    .map(([it, itAmount]) => new Stack<T>(it, itAmount))
    .sort((a, b) => sorter(b.it, a.it))
}

function getCheapest<T extends Identified & Calculable>(
  recipeAmount: number,
  ingredient: Ingredient<T>,
): T | undefined {
  return [...ingredient.matchedBy()].sort(cheapestSort(recipeAmount))[0]
}

function cheapestSort(recipeAmount: number) {
  const sorter = expensiveSort(recipeAmount)
  return (a: Calculable, b: Calculable) => b.purity - a.purity || sorter(a, b)
}

function expensiveSort(recipeAmount: number) {
  return (a: Calculable, b: Calculable) => (a.cost * recipeAmount + a.processing) - (b.cost * recipeAmount + b.processing)
}
