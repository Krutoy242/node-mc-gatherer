import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'immersiveengineering:stone_device:0',
    '27x immersiveengineering:stone_decoration:0',
    'immersiveengineering:tool:0',
  )
  addRecipe(
    'immersiveengineering:stone_device:1',
    '27x immersiveengineering:stone_decoration:1',
    'immersiveengineering:tool:0',
  )
  addRecipe(
    'immersiveengineering:stone_device:7',
    '8x immersiveengineering:stone_decoration:10',
    'immersiveengineering:tool:0',
  )

  addRecipe(
    ['3x immersiveengineering:material:4', '2x immersiveengineering:seed:0'],
    '100x placeholder:ticks',
    'immersiveengineering:seed:0',
  )
}
