import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'immersivepetroleum:metal_multiblock:2',
    [
      '6x immersiveengineering:wooden_decoration:0',
      '2x immersiveengineering:metal_decoration0:4',
      '4x immersiveengineering:sheetmetal:8',
      '2x immersiveengineering:storage:8',
      'immersiveengineering:metal_decoration0:3',
      '2x immersiveengineering:metal_decoration0:5',
      '4x immersiveengineering:metal_device1:6',
      '11x immersiveengineering:metal_decoration1:1',
    ],
    'immersiveengineering:tool:0'
  )
}
