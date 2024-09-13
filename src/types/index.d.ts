import type { Ingredient } from '../api/Ingredient'
import type { Stack } from '../api/Stack'
import type Definition from '../lib/items/Definition'

export type DefIngrStack = Stack<Ingredient<Definition>>
