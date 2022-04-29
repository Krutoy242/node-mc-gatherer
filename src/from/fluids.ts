import { parse as csvParseSync } from 'csv-parse/sync'

import RecipeStore from '../lib/recipes/RecipeStore'

export default async function append_fluids(
  recipeStore: RecipeStore,
  csvText: string
) {
  const fluids: Record<string, string>[] = csvParseSync(csvText, {
    columns: true,
  })

  fluids
    .filter(({ Block }) => Block && Block !== '-')
    .forEach(({ Name, Block }) => {
      recipeStore.addRecipe('fluid_blocks', `1000x fluid:${Name}`, `${Block}:0`)
      recipeStore.addRecipe('fluid_blocks', `${Block}:0`, `1000x fluid:${Name}`)
    })
}
