export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('placeholder:scoop:0', ['forestry:scoop:0'])
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
  addRecipe(
    'forestry:butterfly_ge:*',
    '10000x placeholder:ticks',
    'forestry:sapling:*'
  )
}
