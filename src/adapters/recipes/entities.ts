export default function addRecipes(
  addRecipe: (
    recipe_source: string,
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => void
) {
  // Found in world
  addRecipe('custom_exploration', 'entity:cow', '200x placeholder:exploration')

  addRecipe(
    'entity_interaction',
    'minecraft:milk_bucket:0',
    'minecraft:bucket:0',
    'entity:cow'
  )
}
