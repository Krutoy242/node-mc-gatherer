export default function addRecipes(
  addRecipe: (
    recipe_source: string,
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => void
) {
  addRecipe('interactions', 'minecraft:water_bucket:0', [
    'minecraft:bucket:0',
    '1000x fluid:water',
  ])
}
