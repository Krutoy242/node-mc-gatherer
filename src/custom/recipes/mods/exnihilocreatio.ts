export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    'exnihilocreatio:block_infested_leaves:0',
    'exnihilocreatio:block_infesting_leaves:0'
  )
  addRecipe(
    'exnihilocreatio:block_infesting_leaves:0',
    'ore:treeLeaves',
    'exnihilocreatio:item_material:2'
  )
  addRecipe(
    'exnihilocreatio:crook_tconstruct:0',
    '4x tconstruct:tool_rod:0:{Material:"wood"}',
    'tconstruct:tooltables:3'
  )
}
