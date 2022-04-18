import { AddRecipeFn } from '../../customs'

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
    'immersiveengineering:tool:0'
  )

  addRecipe(
    'immersiveengineering:metal_multiblock:*',
    [
      '4x immersiveengineering:metal_decoration0:3',
      '4x immersiveengineering:metal_decoration0:4',
      '4x immersiveengineering:metal_decoration0:5',
    ],
    'immersiveengineering:tool:0'
  )
}
