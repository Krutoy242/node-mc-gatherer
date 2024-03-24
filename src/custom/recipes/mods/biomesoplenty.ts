export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(['biomesoplenty:blue_fire:0', 'biomesoplenty:jar_empty:0'], 'biomesoplenty:jar_filled:1')
  addRecipe('biomesoplenty:jar_filled:1', ['biomesoplenty:blue_fire:0', 'biomesoplenty:jar_empty:0'])
}
