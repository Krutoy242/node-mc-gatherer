import { readFileSync } from 'fs'
import { join } from 'path'

import { parse as csvParseSync } from 'csv-parse/sync'

import RecipeStore from '../lib/recipes/RecipeStore'

export default async function append_tellme(
  recipeStore: RecipeStore,
  mcPath: string
) {
  const fileContent = readFileSync(
    join(mcPath, 'config/tellme/fluids-csv.csv'),
    'utf8'
  )

  const fluids: Record<string, string>[] = csvParseSync(fileContent, {
    columns: true,
  })

  fluids
    .filter(({ Block }) => Block && Block !== '-')
    .forEach(({ Name, Block }) => {
      recipeStore.addRecipe('fluid_blocks', `1000x fluid:${Name}`, `${Block}:0`)
      recipeStore.addRecipe('fluid_blocks', `${Block}:0`, `1000x fluid:${Name}`)
    })
}
