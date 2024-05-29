export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('openblocks:glyph:*', 'openblocks:generic:10', 'openblocks:drawing_table:0')
  addRecipe('fluid:xpjuice', 'placeholder:xp', 'openblocks:xp_drain:0')
}
