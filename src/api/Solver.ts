import lodash from 'lodash'
import type { Ingredient } from './Ingredient'
import Playthrough from './Playthrough'
import { Stack } from './Stack'

import { solverLoop } from './SolverLoop'
import type { Calculable, Identified, Solvable, SolvableRecipe } from '.'

function sum(arr: number[]) {
  return arr.reduce((acc, curr) => acc + curr)
}

function sortBy<T>(array: T[], extractor: (item: T) => any): T[] {
  return array.sort((a, b) => extractor(a) - extractor(b))
}

type Tail<T extends any[]> = T extends [any, ...infer Part] ? Part : never

type ScendTail = Tail<Required<Parameters<ReturnType<(typeof descending | typeof ascending)>>>>

export function solve<
  T extends Solvable<T>,
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

function descending<T extends Solvable<T>>(playthrough: Playthrough<T>) {
  return (currentSolvable: T, amount = 1) => {
    if (!currentSolvable.recipes?.size)
      return // No recipes

    const [recipe, outputAmount] = bestRecipe(currentSolvable, amount)

    const catalystsDef = toDefStacks(1, recipe.catalysts)
    const inputsDef = toDefStacks(amount, recipe.inputs)

    playthrough.addCatalysts(catalystsDef)
    playthrough.addInputs(inputsDef, amount)

    // Collection of defs should be walked next
    return [
      ...catalystsDef.map(ms => [ms.it, ms.amount ?? 1] as const),
      ...inputsDef.map(ms => [
        ms.it,
        amount / outputAmount * (ms.amount ?? 1),
      ] as const),
    ] as PseudoStack<T>[]
  }
}

function ascending<T extends Solvable<T>>(playthrough: Playthrough<T>) {
  return (currentSolvable: T, behind = new Set<Stack<T>>()) => {
    if (!currentSolvable?.dependencies?.size)
      return undefined

    const defStack = new Stack(currentSolvable)

    const result = [...currentSolvable.dependencies].map((r) => {
      const outputsDef = toDefStacks(1, r.outputs)

      // List of outputs of this recipe
      const ds = outputsDef.filter(s => toDefStacks(s.amount ?? 1, s.it.mainRecipe?.requirments)
        ?.some(st => st.it === currentSolvable),
      )

      if (!ds.length)
        return []

      // Amount of current item as input
      const amount = r.requirments.find(s => s.it.items.includes(currentSolvable))?.amount ?? 1

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

/**
 * Find best recipe for this item for this amount
 */
export function bestRecipe<T extends Solvable<T>>(
  solvable: T,
  amount: number,
) {
  const recipesArray = [...solvable.recipes!.entries()]
  const sortedArr = recipesArray.sort(([recA, amountA], [recB, amountB]) => {
    return recB.purity - recA.purity
      || (recA.cost * amountA * amount + recA.processing) - (recB.cost * amountB * amount + recB.processing)
      || summPurityOfRequirments(recB) - summPurityOfRequirments(recA)
      || unpureNiceScore(recB) - unpureNiceScore(recA)
  })

  return sortedArr[0]
}

function summPurityOfRequirments<T extends Solvable<T>>(a: SolvableRecipe<T>): number {
  return puritySumm(a.inputs) + puritySumm(a.catalysts)
}

function puritySumm<T extends Solvable<T>>(arr?: Stack<Ingredient<T>>[]): number {
  if (!arr)
    return 0
  return arr.reduce(
    (c, d) => c + Math.max(...[...d.it.matchedBy()].map(o => o.purity)),
    0,
  )
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
    .filter((v): v is [T, number | undefined] => !!v[0])
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

function unpureNiceScore<T extends Solvable<T>>(a: SolvableRecipe<T>): number {
  return sum([
    1 - 1 / (sum(a.requirments.map(s => s.it.items.length)) + 1),
    a.catalystsDef?.length === 1 ? 0.25 : 0,
    Number(a.catalystsDef?.[0]?.it.id !== 'minecraft:crafting_table:0'),
    (sum(a.outputs.map(s => s.amount ?? 0)) + 1) / 10,
    Number(a.inputs?.every(s => s.it.items.every(i => i.id.startsWith('minecraft')))),
  ])
}
