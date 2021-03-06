export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('tconstruct:tooltables:2', ['tconstruct:pattern:*', 'ore:logWood'])
  addRecipe(
    '2x tconstruct:shard:0:{Material:"xu_magical_wood"}',
    'extrautils2:decorativesolidwood:1',
    'tconstruct:tooltables:2'
  )
  addRecipe(
    'tconstruct:rack:*',
    '3x ore:slabWood',
    'minecraft:crafting_table:0'
  )
}
