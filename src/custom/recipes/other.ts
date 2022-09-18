export default function addRecipes(
  addRecipe: import('../customs').AddRecipeFn
) {
  addRecipe(
    'minecraft:enchanted_book:*',
    ['minecraft:book:0', '1395x placeholder:xp'],
    'minecraft:enchanting_table:0'
  )
  addRecipe(
    ['3x minecraft:quartz:0', '4x placeholder:xp'],
    'minecraft:quartz_ore:0'
  )
  addRecipe('5x placeholder:xp', '10x placeholder:fight')
  addRecipe('minecraft:leaves:0', '100x placeholder:ticks')

  addRecipe('minecraft:black_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:blue_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:brown_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:cyan_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:gray_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:green_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:light_blue_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:lime_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:magenta_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:orange_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:pink_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:red_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:silver_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:white_shulker_box:0', 'ore:shulkerBox')
  addRecipe('minecraft:yellow_shulker_box:0', 'ore:shulkerBox')
}
