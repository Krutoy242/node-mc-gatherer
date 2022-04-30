export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    'forestry:sapling_ge:*',
    ['minecraft:sapling:*', 'forestry:honey_drop:0'],
    'forestry:portable_alyzer:0'
  )
  addRecipe(
    'forestry:sapling:*',
    ['minecraft:sapling:*', 'forestry:honey_drop:0'],
    'forestry:portable_alyzer:0'
  )
}
