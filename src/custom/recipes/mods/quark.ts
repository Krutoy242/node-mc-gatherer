export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('3x quark:glass_shards:*', 'ore:blockGlass')

  addRecipe('entity:quark:ashen', '2000x placeholder:exploration')
  addRecipe('entity:quark:crab', '2000x placeholder:exploration')
  addRecipe('entity:quark:dweller', '2000x placeholder:exploration')
  addRecipe('entity:quark:foxhound', '200x placeholder:exploration', 'dimension:-1')
  addRecipe('entity:quark:frog', '2000x placeholder:exploration')
  addRecipe('entity:quark:stoneling', '2000x placeholder:exploration')
  addRecipe('entity:quark:wraith', '2000x placeholder:exploration')
}
