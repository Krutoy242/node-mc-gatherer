export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(
    'bibliocraft:enchantedplate:0',
    [
      'bibliocraft:bibliochase:0',
      'minecraft:enchanted_book:*',
      'minecraft:dye:0',
    ],
    ['bibliocraft:typesettingtable:0', 'bibliocraft:printingpress:0'],
  )
}
