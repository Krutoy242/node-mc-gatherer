import { parse as csvParseSync } from 'csv-parse/sync'

import type RecipeStore from '../lib/recipes/RecipeStore'

export interface BlockToFluidMap {
  [blockId: string]: string
}

export default async function append_fluids(
  recipeStore: RecipeStore,
  csvText: string,
): Promise<BlockToFluidMap> {
  const fluids: {
    Name: string
    Density: string
    Temperature: string
    Viscosity: string
    Luminosity: string
    Rarity: string
    isGaseous: string
    Block: string
  }[] = csvParseSync(csvText, {
    columns: true,
  })

  const blockToFluidMap: BlockToFluidMap = {}

  fluids
    .filter(({ Block }) => Block && Block !== '-')
    .forEach(({ Name, Block }) => {
      const blockId = `${Block}:0`
      blockToFluidMap[blockId] = `fluid:${Name}`
      recipeStore.addRecipe('fluid_blocks', `1000x fluid:${Name}`, blockId)
      recipeStore.addRecipe('fluid_blocks', blockId, `1000x fluid:${Name}`)
    })

  return blockToFluidMap
}
