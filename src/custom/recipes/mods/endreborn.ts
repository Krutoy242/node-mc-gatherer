export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('endreborn:sword_shard:0', [
    '10000x placeholder:fight',
    'endreborn:block_rune:0',
    '9x minecraft:purpur_block:0',
  ])
  addRecipe('entity:endreborn:watcher', '5000x placeholder:exploration', 'dimension:1')
  addRecipe('entity:endreborn:endguard', '5000x placeholder:exploration', 'dimension:1')
  addRecipe('entity:endreborn:chronologist', '5000x placeholder:exploration', 'dimension:1')
}
