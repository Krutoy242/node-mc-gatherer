import Calculable from './Calculable'
import Identified from './Identified'
import Ingredient from './Ingredient'
import Stack from './Stack'

/**
 * Stack is ingredient that have amount
 */
export type IngredientStack = Stack<Ingredient<Calculable & Identified>>
