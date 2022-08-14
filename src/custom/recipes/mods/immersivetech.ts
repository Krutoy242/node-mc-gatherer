import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
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

  // TODO: add right amounts of ingredients
  ;[
    'multiblock:tile.immersivetech.metal_multiblock.boiler4',
    'multiblock:tile.immersivetech.metal_multiblock.cooling_tower14',
    'multiblock:tile.immersivetech.metal_multiblock.distiller0',
    'multiblock:tile.immersivetech.metal_multiblock.solar_tower1',
    'multiblock:tile.immersivetech.metal_multiblock.steam_turbine3',
    'multiblock:tile.immersivetech.metal_multiblock1.electrolytic_crucible_battery6',
    'multiblock:tile.immersivetech.metal_multiblock1.gas_turbine0',
    'multiblock:tile.immersivetech.metal_multiblock1.heat_exchanger2',
    'multiblock:tile.immersivetech.metal_multiblock1.high_pressure_steam_turbine4',
    'multiblock:tile.immersivetech.metal_multiblock1.radiator10',
  ].forEach((multiblock) => {
    addRecipe(
      multiblock,
      [
        '8x immersiveengineering:metal_decoration0:3',
        '8x immersiveengineering:metal_decoration0:4',
        '8x immersiveengineering:metal_decoration0:5',
      ],
      'immersiveengineering:tool:0'
    )
  })
}
