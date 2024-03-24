import type { AddRecipeFn } from '../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'dimension:-1',
    '0.015x minecraft:flint_and_steel:0',
    '8x minecraft:obsidian:0',
  )
  addRecipe('dimension:1', '12x minecraft:ender_eye:0')

  addRecipe('1000x fluid:water', 'placeholder:exploration')

  // Recipes in dimensions
  addRecipe(
    'minecraft:dragon_breath:0',
    'minecraft:glass_bottle:0',
    'dimension:1',
  )

  addRecipe('minecraft:obsidian:0', '1000x fluid:lava', '1000x fluid:water')
  addRecipe('1000x fluid:lava', '100x placeholder:exploration', 'minecraft:bucket:0')
}
