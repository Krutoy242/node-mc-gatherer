import _ from 'lodash'

import Calculable from './Calculable'
import Identified from './Identified'
import IngredientStack from './IngredientStack'
import Playthrough from './Playthrough'
import Stack from './Stack'

interface SolvableRecipe extends Calculable {
  catalysts?: IngredientStack[]
  inputs?: IngredientStack[]
}

interface Solvable extends Identified {
  recipes?: Set<SolvableRecipe>
  mainRecipe?: SolvableRecipe
}

export default function solve(
  def: Solvable,
  log?: {
    writeLn: (str: string) => void
    complLength: (stack: Stack<Solvable>) => number
  }
) {
  const playthrough = new Playthrough()

  defToString(def, 1)

  return playthrough

  function defToString(
    def: Solvable,
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

    const catalysts = IngredientStack.toDefStacks(recipe.catalysts)
    const usages = IngredientStack.toDefStacks(recipe.inputs)

    playthrough.addCatalysts(catalysts)
    playthrough.addInputs(usages, amount)

    const combined = _.uniqBy([catalysts, usages].flat(), (ms) => ms.it.id)
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

    function further(ms: Stack<Identified>) {
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
