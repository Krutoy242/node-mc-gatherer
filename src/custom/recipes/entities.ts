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
  addRecipe('entity_interaction', '1000x fluid:milk', '2x placeholder:ticks', [
    'minecraft:bucket:0',
    'entity:cow',
  ])

  addRecipe(
    'custom_entity',
    'draconicevolution:mob_soul:0:{EntityName:"excompressum:angry_chicken"}',
    '2000x placeholder:ticks'
  )
}
