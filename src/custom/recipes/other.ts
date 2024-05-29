export default function addRecipes(
  addRecipe: import('../customs').AddRecipeFn,
) {
  addRecipe(
    'minecraft:enchanted_book:*',
    ['minecraft:book:0', '1395x placeholder:xp'],
    'minecraft:enchanting_table:0',
  )
  addRecipe(
    ['3x minecraft:quartz:0', '4x placeholder:xp'],
    'minecraft:quartz_ore:0',
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

  addRecipe('minecraft:cobblestone:0', '10x placeholder:ticks', ['1000x fluid:lava', '1000x fluid:water'])
  addRecipe(['8x minecraft:tallgrass:1', '2x minecraft:yellow_flower:0', '2x minecraft:red_flower:0'], 'ore:fertilizer', ['minecraft:grass:0'])
  addRecipe('minecraft:potion:0:{Potion:"minecraft:water"}', 'minecraft:glass_bottle:0', '1000x fluid:water')

  addRecipe('entity:minecraft:armor_stand', 'minecraft:armor_stand:0')
  addRecipe('minecraft:firework_charge:0', ['minecraft:gunpowder:0', 'ore:dye'])
  addRecipe('3x minecraft:fireworks:0', ['minecraft:paper:0', 'minecraft:gunpowder:0'])
}
