import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'immersiveengineering:metal_multiblock:0',
    [
      'minecraft:piston:0',
      '2x immersiveengineering:metal_decoration1:1',
      '2x immersiveengineering:conveyor:0:{conveyorType:"immersiveengineering:conveyor"}',
      'immersiveengineering:metal_decoration0:5',
      'immersiveengineering:metal_decoration0:3',
    ],
    'immersiveengineering:tool:0',
  )

  addRecipe(
    'immersiveengineering:metal_multiblock:*',
    [
      '4x immersiveengineering:metal_decoration0:3',
      '4x immersiveengineering:metal_decoration0:4',
      '4x immersiveengineering:metal_decoration0:5',
    ],
    'immersiveengineering:tool:0',
  )

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
