export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    '2x appliedenergistics2:material:48',
    ['appliedenergistics2:material:47', 'appliedenergistics2:material:46'],
    'minecraft:tnt:0'
  )
  addRecipe('appliedenergistics2:material:6', '256x minecraft:cobblestone:0', [
    'appliedenergistics2:condenser:0',
    'appliedenergistics2:material:35',
  ])
  addRecipe(
    'appliedenergistics2:material:47',
    '256000x minecraft:cobblestone:0',
    ['appliedenergistics2:condenser:0', 'appliedenergistics2:material:38']
  )
}
