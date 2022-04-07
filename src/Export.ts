import customRender from './adapters/visual'
import { NameMap } from './from/JEIExporterTypes'
import Definition from './lib/Definition'
import { DefinitionStoreMap, ExportDefinition } from './lib/DefinitionStore'
import RecipeStore from './lib/RecipeStore'
import { CountableFunction, createFileLogger } from './log/logger'
// import { StackDef } from './lib/Stack'

export interface ExportEntry {
  id: string
  viewBox?: string
  display?: string
  recipes?: Set<number>
}

export interface ExportData {
  store: {
    [id: string]: ExportDefinition
  }
  recipes: {
    outputs: string[]
    inputs?: string[]
    catalysts?: string[]
  }[]
}

interface Loggers {
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

  const store = recipesStore.definitionStore.store
  Object.entries(store).forEach(([key, def]) =>
    assignVisuals(key, def, store, nameMap, log)
  )

  console.log('noViewBox :>> ', log.noViewBox.count)
  console.log('noDisplay :>> ', log.noDisplay.count)
  recipesStore.calculate()

  return {
    store: recipesStore.definitionStore.export(),
    recipes: recipesStore.export(),
  }
}

function assignVisuals(
  key: string,
  def: Definition,
  store: DefinitionStoreMap,
  nameMap: NameMap,
  log: Loggers
) {
  if (def.viewBox && def.display) return
  const hasRecipe = !!def.recipes

  const { source, entry, meta, tag } = getGroups(key)

  const attempts: string[] = []

  if (meta && meta !== '0') attempts.push(`${source}:${entry}:${meta}`)
  else attempts.push(`${source}:${entry}:0`)
  attempts.push(`${source}:${entry}`)

  attempts.forEach((id) => assignVisual(def, id, store))

  if (!tag) attempts.unshift(key)
  else attempts.push(`${source}:${entry}:${meta ?? 0}:${unsignedHash(tag)}`)
  let map = nameMap[def.iType]
  attempts.forEach((id) => (def.display ??= map[id]?.en_us))

  // for Fluids
  map = (nameMap as any)[source]
  if (map) def.display ??= map[entry]?.en_us

  if (def.viewBox && def.display) return
  const [viewBox, display] = customRender(store, source, entry, meta, tag)
  def.viewBox ??= viewBox
  def.display ??= display

  if (!def.display) {
    def.display ??= `[${key}]`
    if (hasRecipe) log.noDisplay(key + '\n')
  }

  if (!def.viewBox) {
    def.viewBox ??= store['openblocks:dev_null:0']?.viewBox
    if (hasRecipe) log.noViewBox(key + '\n')
  }
}

function assignVisual(def: Definition, id: string, store: DefinitionStoreMap) {
  if (def.viewBox && def.display) return
  const { viewBox, display } = store[id] ?? {}
  def.viewBox ??= viewBox
  def.display ??= display
}

function getGroups(key: string) {
  const groups =
    key.match(
      /^(?<source>[^:{]+)(?::(?<entry>[^:{]+))?(?::(?<meta>[^:{]+))?(:(?<tag>\{.*\}))?$/
    )?.groups ?? {}

  if (!groups.source) throw new Error(`Error on parsing ID: "${key}"`)
  return groups
}

;(String.prototype as any).hashCode = function () {
  let hash = 0
  let i
  let chr
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
