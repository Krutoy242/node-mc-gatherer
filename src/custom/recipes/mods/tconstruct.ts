export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('tconstruct:tooltables:2', ['tconstruct:pattern:*', 'ore:logWood'])
  addRecipe(
    '8x tconstruct:shard:0:{Material:"wood"}',
    'ore:logWood',
    'tconstruct:tooltables:2'
  )
  addRecipe(
    '2x tconstruct:shard:0:{Material:"xu_magical_wood"}',
    'extrautils2:decorativesolidwood:1',
    'tconstruct:tooltables:2'
  )
  addRecipe('tconstruct:rack:0', '3x ore:slabWood', 'minecraft:crafting_table:0')
  addRecipe('tconstruct:rack:1', '3x ore:slabWood', 'minecraft:crafting_table:0')
  addRecipe('tconstruct:materials:19', ['tconstruct:materials:18', '160x placeholder:xp'], 'minecraft:bookshelf:0')

  addRecipe('tconstruct:tooltables:1', 'tconstruct:tooltables:1')
  addRecipe('tconstruct:toolforge:0', 'tconstruct:toolforge:0')
  addRecipe('tconstruct:edible:0', '100x placeholder:ticks', 'ore:ingotPigiron')
}
