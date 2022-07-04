import Stack from '../../api/Stack'
import Calculable from '../calc/Calculable'

import Definition from './Definition'
import { DefinitionStack } from './DefinitionStack'
import Ingredient from './Ingredient'

/**
 * Stack is ingredient that have amount
 */
export default class IngredientStack extends Stack<Ingredient<Definition>> {
  static toDefStacks(stacks?: IngredientStack[]): DefinitionStack[] {
    if (!stacks) return []
    return stacks
      .map(({ it, amount }) => new DefinitionStack(getCheapest(it), amount))
      .sort(expensiveSort)
  }

  static fromString(
    str: string,
    getFromId: (id: string) => Ingredient<Definition>
  ): IngredientStack {
    if (str === undefined || str === '')
      throw new Error('Stack cannot be empty')

    const g = str.match(/^((?<amount>[^ ]+)x )?(?<id>.+)$/)?.groups
    if (!g) throw new Error(`Cant parse stack for: ${str}`)

    const amount = g.amount === undefined ? 1 : Number(g.amount)

    return new IngredientStack(getFromId(g.id), g.amount ? amount : 1)
  }
}

function getCheapest(ingredient: Ingredient<Definition>): Definition {
  return [...ingredient.matchedBy()].sort(cheapestSort)[0]
}

function cheapestSort(a: Calculable, b: Calculable) {
  return b.purity - a.purity || a.complexity - b.complexity
}

function expensiveSort(a: DefinitionStack, b: DefinitionStack) {
  return b.it.complexity - a.it.complexity
}
