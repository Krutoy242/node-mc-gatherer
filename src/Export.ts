import { NameMap } from './from/JEIExporterTypes'
import { DefinitionStoreMap, ExportDefinition } from './lib/DefinitionStore'
import RecipeStore from './lib/RecipeStore'
// import { StackDef } from './lib/Stack'

export type ExportEntry = {
  id: string
  viewBox?: string
  display?: string
  recipes?: Set<number>
}

export type ExportData = {
  store: {
    [id: string]: ExportDefinition
  }
  recipes: {
    outputs: string[]
    inputs?: string[]
    catalysts?: string[]
  }[]
}

export default function exportData(
  recipesStore: RecipeStore,
  tooltipMap: NameMap
): ExportData {
  assignVisuals(recipesStore.definitionStore.store, tooltipMap)

  return {
    store: recipesStore.definitionStore.export(),
    recipes: recipesStore.export(),
  }
}

function assignVisuals(store: DefinitionStoreMap, tooltipMap: NameMap) {
  for (const key in store) {
    const ad = store[key]
    const hasRecipe = !!ad.recipes
    if (ad.viewBox && ad.display) continue

    const { source, entry, meta, tag } =
      key.match(
        /^(?<source>[^:{]+)(?::(?<entry>[^:{]+))?(?::(?<meta>[^:{]+))?(:(?<tag>\{.*\}))?$/
      )?.groups ?? {}

    if (!source) throw new Error(`Error on parsing ID: "${key}"`)

    const attempts = [
      `${source}:${entry}:${meta}`,
      `${source}:${entry}:0`,
      `${source}:${entry}`,
    ]

    attempts.forEach((id) => {
      if (ad.viewBox && ad.display) return
      const { viewBox, display } = store[id] ?? {}
      ad.viewBox ??= viewBox
      ad.display ??= display
    })

    let map = tooltipMap[ad.iType]
    ad.display ??= (
      map[key] ??
      map[`${source}:${entry}:${meta}`] ??
      map[`${source}:${entry}:0`] ??
      map[`${source}:${entry}`]
    )?.en_us

    // for Fluids
    map = (tooltipMap as any)[source]
    if (map) ad.display ??= map[entry]?.en_us

    const [viewBox, display] = customRender(store, source, entry, meta, tag)
    ad.viewBox ??= viewBox
    ad.display ??= display
    if (ad.viewBox && ad.display) continue

    if (!ad.display) {
      ad.display ??= `[${key}]`
      if (hasRecipe)
        console.log(' cant find Display for', key.substring(0, 100))
    }

    if (!ad.viewBox) {
      ad.viewBox ??= store['openblocks:dev_null:0']?.viewBox
      if (hasRecipe)
        console.log(` cant find 🖼️  for [${key.substring(0, 100)}]  `)
    }
  }
}

function customRender(
  store: DefinitionStoreMap,
  source: string,
  entry: string,
  _meta: string,
  _tag: string
) {
  if (source === 'aspect') {
    const a =
      store[
        `thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"${entry.toLowerCase()}"}]}`
      ]
    return [a.viewBox, 'Aspect: ' + entry]
  }

  if (source === 'placeholder') {
    if (entry === 'RF') {
      return [store['thermalfoundation:meter:0'].viewBox, '{' + entry + '}']
    }
    if (entry === 'Exploration') {
      return [store['botania:tinyplanet:0'].viewBox, '{' + entry + '}']
    }
    const a =
      store[
        'openblocks:tank:0:{tank:{FluidName:"betterquesting.placeholder",Amount:16000}}'
      ]
    return [a.viewBox, '{' + entry + '}']
  }

  if (source === 'thaumcraft' && entry === 'infernal_furnace') {
    const a = store['minecraft:nether_brick:0']
    return [a.viewBox]
  }

  return []
}
