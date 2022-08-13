export default function addRecipes(
  addRecipe: import('../customs').AddRecipeFn
) {
  addRecipe(
    `minecraft:enchanted_book:*`,
    [`minecraft:book:0`, '1395x placeholder:xp'],
    `minecraft:enchanting_table:0`
  )
}
