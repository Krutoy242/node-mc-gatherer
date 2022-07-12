import { uniqBy } from 'lodash'

import { Ingredient } from './Ingredient'
import Playthrough from './Playthrough'
import { Stack } from './Stack'

import { Calculable, Identified, IngredientStack } from '.'

interface SolvableRecipe extends Calculable {
  catalysts?: IngredientStack[]
  inputs?: IngredientStack[]
}

interface Solvable extends Identified, Calculable {
  recipes?: Set<SolvableRecipe>
  mainRecipe?: SolvableRecipe
}

export default function solve<T extends Solvable>(
  def: T,
  log?: {
    writeLn: (str: string) => void
    complLength: (stack: Stack<T>) => number
  }
): Playthrough<T> {
  const playthrough = new Playthrough<T>()

  defToString(def, 1)

  return playthrough

  function defToString(
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

    const catalysts = toDefStacks<T>(recipe.catalysts as any) // Sorry for that dirty type assertion ='(
    const usages = toDefStacks<T>(recipe.inputs as any)

    playthrough.addCatalysts(catalysts)
    playthrough.addInputs(usages, amount)

    const combined = uniqBy([catalysts, usages].flat(), (ms) => ms.it.id)
    const maxPad = log
      ? Math.max(...combined.map((ms) => log.complLength(ms)))
      : 0

    const onHold = new Set<string>()
    combined.forEach(({ it: { id } }) => {
      if (antiloop.has(id)) return
      onHold.add(id)
      antiloop.add(id)
    })

    catalysts.forEach(further)
    usages.forEach(further)

    function further(ms: Stack<T>) {
      if (onHold.has(ms.it.id)) {
        onHold.delete(ms.it.id)
        antiloop.delete(ms.it.id)
      }
      defToString(
        ms.it,
        amount * (ms.amount ?? 1),
        antiloop,
        maxPad,
        tabLevel + 1
      )
    }
  }

  function recipeSorter(a: SolvableRecipe, b: SolvableRecipe): number {
    return sortCheapest(a, b) || reqPuritySumm(b) - reqPuritySumm(a)
  }

  function sortCheapest(a: Calculable, b: Calculable): number {
    return b.purity - a.purity || a.complexity - b.complexity
  }

  function reqPuritySumm(a: SolvableRecipe): number {
    return puritySumm(a.inputs) + puritySumm(a.catalysts)
  }

  function puritySumm(arr?: IngredientStack[]): number {
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
