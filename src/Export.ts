import customRender from './adapters/visual'
import { NameMap } from './from/JEIExporterTypes'
import { DefinitionStoreMap, ExportDefinition } from './lib/DefinitionStore'
import RecipeStore from './lib/RecipeStore'
import { CountableFunction, createFileLogger } from './log/logger'
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

type Loggers = {
  [key: string]: CountableFunction
}

export default function exportData(
  recipesStore: RecipeStore,
  nameMap: NameMap
): ExportData {
  const log = {
    noViewBox: createFileLogger('noViewBox.log'),
    noDisplay: createFileLogger('noDisplay.log'),
  }

  assignVisuals(recipesStore.definitionStore.store, nameMap, log)

  console.log('noViewBox :>> ', log.noViewBox.count)
  console.log('noDisplay :>> ', log.noDisplay.count)

  return {
    store: recipesStore.definitionStore.export(),
    recipes: recipesStore.export(),
  }
}

function assignVisuals(
  store: DefinitionStoreMap,
  nameMap: NameMap,
  log: Loggers
) {
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

    let map = nameMap[ad.iType]
    ad.display ??= (
      map[key] ??
      map[`${source}:${entry}:${meta ?? 0}`] ??
      map[`${source}:${entry}:0`] ??
      map[`${source}:${entry}`] ??
      map[`${source}:${entry}:${meta ?? 0}:${unsignedHash(tag ?? '')}`]
    )?.en_us

    // for Fluids
    map = (nameMap as any)[source]
    if (map) ad.display ??= map[entry]?.en_us

    const [viewBox, display] = customRender(store, source, entry, meta, tag)
    ad.viewBox ??= viewBox
    ad.display ??= display
    if (ad.viewBox && ad.display) continue

    if (!ad.display) {
      ad.display ??= `[${key}]`
      if (hasRecipe) log.noDisplay(key + '\n')
    }

    if (!ad.viewBox) {
      ad.viewBox ??= store['openblocks:dev_null:0']?.viewBox
      if (hasRecipe) log.noViewBox(key + '\n')
    }
  }
}

;(String.prototype as any).hashCode = function () {
  let hash = 0,
    i,
    chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function unsignedHash(str: string) {
  let number = (str as any).hashCode()
  if (number < 0) {
    number = 0xffffffff + number + 1
  }

  return number.toString(16)
}
