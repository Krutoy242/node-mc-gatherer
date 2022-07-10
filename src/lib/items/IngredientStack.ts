import Ingredient from '../../api/Ingredient'
import Stack from '../../api/Stack'
import Calculable from '../calc/Calculable'

import Definition from './Definition'
import { DefinitionStack } from './DefinitionStack'

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
