export default function addRecipes(
  addRecipe: (
    recipe_source: string,
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => void
) {
  addRecipe(
    'custom_animania',
    'animania:sheep_cheese_wheel:0',
    'fluid:milk_sheep',
    'animania:cheese_mold:0'
  )
  addRecipe(
    'custom_animania',
    'animania:goat_cheese_wheel:0',
    'fluid:milk_goat',
    'animania:cheese_mold:0'
  )
  addRecipe(
    'custom_animania',
    'animania:jersey_cheese_wheel:0',
    'fluid:milk_jersey',
    'animania:cheese_mold:0'
  )
  addRecipe(
    'custom_animania',
    'animania:holstein_cheese_wheel:0',
    'fluid:milk_holstein',
    'animania:cheese_mold:0'
  )
  addRecipe(
    'custom_animania',
    'animania:friesian_cheese_wheel:0',
    'fluid:milk_friesian',
    'animania:cheese_mold:0'
  )
  ;[
    'animania:blue_peacock_feather:0',
    'animania:white_peacock_feather:0',
    'animania:charcoal_peacock_feather:0',
    'animania:opal_peacock_feather:0',
    'animania:peach_peacock_feather:0',
    'animania:purple_peacock_feather:0',
    'animania:taupe_peacock_feather:0',
  ].forEach((s) => addRecipe('custom_animania', s, '300x placeholder:ticks'))
}
