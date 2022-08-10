import { uniqBy } from 'lodash'

import { Ingredient } from './Ingredient'
import Playthrough from './Playthrough'
import { Stack } from './Stack'

import { Calculable, Identified, IngredientStack } from '.'

interface SolvableRecipe<T extends Identified> extends Calculable {
  catalysts?: Stack<Ingredient<T>>[]
  inputs?: Stack<Ingredient<T>>[]
  catalystsDef?: Stack<T>[]
  inputsDef?: Stack<T>[]
}

interface Solvable<T extends Identified> extends Identified, Calculable {
  recipes: Set<SolvableRecipe<T>> | undefined
  mainRecipe: SolvableRecipe<T> | undefined
  mainRecipeAmount?: number | undefined
}

export function solve<T extends Solvable<T>>(
  def: T,
  log?: {
    writeLn: (str: string) => void
    complLength: (stack: Stack<T>) => number
  }
): Playthrough<T> {
  const playthrough = new Playthrough<T>()

  purchase(def, 1)

  return playthrough

  function purchase(
    def: T,
    amount: number,
    antiloop = new Set<string>(),
    complexityPad = 1,
    tabLevel = 0
  ) {
    if (antiloop.has(def.id)) return
    antiloop.add(def.id)

    let tab: string
    if (log) {
      tab = '  '.repeat(tabLevel)
      log.writeLn(tab + (def as any).toString({ complexityPad }))
    }

    if (!def.recipes || def.recipes.size === 0) return // No recipes

    const recipe = def.mainRecipe ?? [...def.recipes].sort(recipeSorter)[0]

    if (log) {
      recipe
        .toString()
        .split('\n')
        .forEach((line) => log.writeLn(tab + '  ' + line))
    }

    recipe.catalystsDef = toDefStacks(recipe.catalysts)
    recipe.inputsDef = toDefStacks(recipe.inputs)

    playthrough.addCatalysts(recipe.catalystsDef)
    playthrough.addInputs(recipe.inputsDef, amount)

    const combined = uniqBy(
      [recipe.catalystsDef, recipe.inputsDef].flat(),
      (ms) => ms.it.id
    )
    const maxPad = log
      ? Math.max(...combined.map((ms) => log.complLength(ms)))
      : 0

    // --------------------
    // Holded items - items that would be purchased later
    const onHold = new Set<string>()
    combined.forEach(({ it: { id } }) => {
      if (antiloop.has(id)) return
      onHold.add(id)
      antiloop.add(id)
    })
    const unhold = (id: string) =>
      onHold.has(id) && (onHold.delete(id), antiloop.delete(id))
    // --------------------

    recipe.catalystsDef.forEach((ms) => further(ms, 1))
    recipe.inputsDef.forEach((ms) =>
      further(ms, amount / (ms.it.mainRecipeAmount ?? 1))
    )

    function further(ms: Stack<T>, mult: number) {
      unhold(ms.it.id)
      purchase(ms.it, mult * (ms.amount ?? 1), antiloop, maxPad, tabLevel + 1)
    }
  }

  function recipeSorter(a: SolvableRecipe<T>, b: SolvableRecipe<T>): number {
    return sortCheapest(a, b) || reqPuritySumm(b) - reqPuritySumm(a)
  }

  function sortCheapest(a: Calculable, b: Calculable): number {
    return b.purity - a.purity || a.complexity - b.complexity
  }

  function reqPuritySumm(a: SolvableRecipe<T>): number {
    return puritySumm(a.inputs) + puritySumm(a.catalysts)
  }

  function puritySumm(arr?: Stack<Ingredient<T>>[]): number {
    if (!arr) return 0
    return arr.reduce(
      (c, d) => c + Math.max(...[...d.it.matchedBy()].map((o) => o.purity)),
      0
    )
  }
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
