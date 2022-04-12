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
}
