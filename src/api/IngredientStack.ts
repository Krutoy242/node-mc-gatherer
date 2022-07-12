import Calculable from './Calculable'
import Identified from './Identified'
import Ingredient from './Ingredient'
import Stack from './Stack'

/**
 * Stack is ingredient that have amount
 */
export default class IngredientStack extends Stack<
  Ingredient<Calculable & Identified>
> {
  static toDefStacks(
    stacks?: IngredientStack[]
  ): Stack<Calculable & Identified>[] {
    if (!stacks) return []
    return stacks
      .map(
        ({ it, amount }) =>
          new Stack<Calculable & Identified>(getCheapest(it), amount)
      )
      .sort(expensiveSort)
  }
}

function getCheapest(
  ingredient: Ingredient<Calculable & Identified>
): Calculable & Identified {
  return [...ingredient.matchedBy()].sort(cheapestSort)[0]
}

function cheapestSort(a: Calculable, b: Calculable) {
  return b.purity - a.purity || a.complexity - b.complexity
}

function expensiveSort(a: Stack<Calculable>, b: Stack<Calculable>) {
  return b.it.complexity - a.it.complexity
}
