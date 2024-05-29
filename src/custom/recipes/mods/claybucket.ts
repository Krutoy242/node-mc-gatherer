export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('claybucket:claybucket:1', ['1000x fluid:water', 'claybucket:claybucket:0'])
  addRecipe('claybucket:claybucket:2', ['1000x fluid:lava', 'claybucket:claybucket:0'])
  addRecipe('1000x fluid:lava', 'claybucket:claybucket:2')
  addRecipe(['1000x fluid:water', 'claybucket:claybucket:0'], 'claybucket:claybucket:1')
}
