export default function addRecipes(
  addRecipe: import('../customs').AddRecipeFn
) {
  addRecipe(
    `minecraft:enchanted_book:*`,
    [`minecraft:book:0`, '1395x placeholder:xp'],
    `minecraft:enchanting_table:0`
  )
  addRecipe(
    ['3x minecraft:quartz:0', '4x placeholder:xp'],
    'minecraft:quartz_ore:0'
  )
  addRecipe('5x placeholder:xp', '10x placeholder:fight')
}
