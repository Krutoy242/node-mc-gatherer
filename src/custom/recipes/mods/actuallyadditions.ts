export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('actuallyadditions:item_hairy_ball:0', '47000x placeholder:ticks')

  addRecipe(
    'actuallyadditions:item_battery_double:0:*',
    'actuallyadditions:item_battery_double:0'
  )
  addRecipe(
    'actuallyadditions:item_solidified_experience:0',
    '100x fluid:essence',
    'actuallyadditions:block_xp_solidifier:0'
  )
  addRecipe('actuallyadditions:item_water_bowl:0', [
    'minecraft:bowl:0',
    '1000x fluid:water',
  ])
}
