import {
  Ingredient,
  JEIExporterCategory,
  Recipe,
} from '../from/JEIExporterTypes'
import Stack from '../lib/Stack'
const { max, min } = Math

export default function getCatalysts(
  categoryCatalysts: Stack[],
  categoryId: string,
  _category: JEIExporterCategory,
  makeStack: (ingr: Ingredient, amount: number) => Stack,
  recipe: Recipe
): Stack[] {
  if (categoryId === 'minecraft__crafting') {
    const x = recipe.input.items.map((slot) => slot.x)
    const y = recipe.input.items.map((slot) => slot.y)
    if (max(...x) - min(...x) <= 18 && max(...y) - min(...y) <= 18) return []
  }

  if (categoryId === 'tconstruct__casting_table') {
    const stack = recipe.input.items[1].stacks[0]
    if (stack) {
      const name = stack.name
      if (
        name.startsWith('tcomplement:cast:') ||
        name.startsWith('tconstruct:cast:') ||
        name.startsWith('tconstruct:cast_custom:')
      ) {
        recipe.input.items.splice(1, 1)
        return [...categoryCatalysts, makeStack(stack, 1)]
      }
    }
  }

  return categoryCatalysts
}
