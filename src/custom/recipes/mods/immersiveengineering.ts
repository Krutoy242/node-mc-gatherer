export default function addRecipes(
  addRecipe: (
    recipe_source: string,
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => void
) {
  addRecipe(
    'custom:immersive',
    'multiblock:tile.immersivetech.metal_multiblock1.melting_crucible8',
    [
      '6x immersiveengineering:metal_decoration1:1',
      'immersiveengineering:metal_decoration0:3',
      '2x immersiveengineering:metal_decoration0:4',
      '4x immersivetech:metal_barrel:2',
      'immersiveengineering:metal_device1:1',
      'immersiveengineering:metal_device1:6',
    ],
    'immersiveengineering:tool:0'
  )

  addRecipe(
    'custom:immersive',
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
}
