export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(
    'tcomplement:sledge_hammer:0',
    [
      'tcomplement:sledge_head:0:{Material:"wood"}',
      'tconstruct:tool_rod:0:{Material:"wood"}',
    ],
    'tconstruct:tooltables:3',
  )
}
