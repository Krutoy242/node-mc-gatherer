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

  // Temporary solution - fireproof blocks is just blocks + time
  // True way is using breeding
  addRecipe('forestry:logs.fireproof.0:1', ['forestry:logs.0:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.0:2', ['forestry:logs.0:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.0:3', ['forestry:logs.0:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.0:0', ['forestry:logs.0:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.1:1', ['forestry:logs.1:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.1:2', ['forestry:logs.1:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.1:3', ['forestry:logs.1:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.1:0', ['forestry:logs.1:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.2:1', ['forestry:logs.2:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.2:2', ['forestry:logs.2:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.2:3', ['forestry:logs.2:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.2:0', ['forestry:logs.2:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.3:1', ['forestry:logs.3:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.3:2', ['forestry:logs.3:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.3:3', ['forestry:logs.3:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.3:0', ['forestry:logs.3:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.4:1', ['forestry:logs.4:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.4:2', ['forestry:logs.4:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.4:3', ['forestry:logs.4:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.4:0', ['forestry:logs.4:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.5:1', ['forestry:logs.5:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.5:2', ['forestry:logs.5:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.5:3', ['forestry:logs.5:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.5:0', ['forestry:logs.5:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.6:1', ['forestry:logs.6:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.6:2', ['forestry:logs.6:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.6:3', ['forestry:logs.6:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.6:0', ['forestry:logs.6:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.fireproof.7:0', ['forestry:logs.7:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.vanilla.fireproof.0:1', ['minecraft:log:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.vanilla.fireproof.0:2', ['minecraft:log:2', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.vanilla.fireproof.0:3', ['minecraft:log:3', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.vanilla.fireproof.0:0', ['minecraft:log:0', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.vanilla.fireproof.1:1', ['minecraft:log2:1', '1000x placeholder:ticks'])
  addRecipe('forestry:logs.vanilla.fireproof.1:0', ['minecraft:log2:0', '1000x placeholder:ticks'])
}
