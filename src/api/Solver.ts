import type { Ingredient } from './Ingredient'
import Playthrough from './Playthrough'
import { Stack } from './Stack'

import { solverLoop } from './SolverLoop'
import type { Calculable, Identified, Solvable, SolvableRecipe } from '.'

type Tail<T extends any[]> = T extends [any, ...infer Part] ? Part : never
// type Head<T extends any[]> = T extends [...infer Part, any] ? Part : never

// export function solveLogDescend<F extends typeof solveLog>(
//   ...params: Head<Parameters<F>>
// ) {
//   // @ts-expect-error ts cant do this
//   return solveLog(...params, false)
// }

// export function solveLogAscend<F extends typeof solveLog>(
//   ...params: Head<Parameters<F>>
// ) {
//   // @ts-expect-error ts cant do this
//   return solveLog(...params, true)
// }

type ScendTail = Tail<Parameters<ReturnType<typeof descending>>>
export function solveLog<T extends Solvable<T>, U extends readonly any[]>(
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
  const descend = (isAscend ? descending : descending)(playthrough)

  solverLoop<T, [...ScendTail, ...U]>(
    (def, amount, ...args) => {
      const combined = descend(def, amount)
      const logArgs = log(def, combined, amount, ...args)

      return combined?.map(ms => [...ms, ...logArgs as U] as const)
    }
  )(topDef, 1, ...logDefaultArgs)

  return playthrough
}

function descending<T extends Solvable<T>>(playthrough: Playthrough<T>) {
  return (def: T, amount: number) => {
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
): Stack<T>[] {
  if (!stacks) return []
  return stacks
    .map(({ it, amount }) => new Stack<T>(getCheapest(it), amount))
    .sort(expensiveSort)
}

function getCheapest<T extends Identified & Calculable>(
  ingredient: Ingredient<T>
): T {
  return [...ingredient.matchedBy()].sort(cheapestSort)[0]
}

function cheapestSort(a: Calculable, b: Calculable) {
  return b.purity - a.purity || a.complexity - b.complexity
}

function expensiveSort(a: Stack<Calculable>, b: Stack<Calculable>) {
  return b.it.complexity - a.it.complexity
}
