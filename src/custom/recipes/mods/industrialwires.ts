export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('actuallyadditions:item_hairy_ball:0', '47000x placeholder:ticks')

  addRecipe(
    'actuallyadditions:item_battery_double:0:*',
    'actuallyadditions:item_battery_double:0',
  )
  addRecipe(
    'actuallyadditions:item_solidified_experience:0',
    '100x fluid:essence',
    'actuallyadditions:block_xp_solidifier:0',
  )
  addRecipe('actuallyadditions:item_water_bowl:0', [
    'minecraft:bowl:0',
    '1000x fluid:water',
  ])
  addRecipe('industrialwires:hv_multiblock:0', [
    '2x immersiveengineering:metal_decoration0:5',
    '8x immersiveengineering:metal_decoration1:0',
    '8x immersiveengineering:metal_decoration2:1',
    '10x immersiveengineering:connector:5',
    '10x immersiveengineering:metal_device0:2',
    'immersiveengineering:connector:4',
    'immersiveengineering:connector:12',
    'immersiveengineering:storage:8',
  ])
}
