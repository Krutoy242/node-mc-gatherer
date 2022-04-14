import customRender from './custom/visual'
import { NameMap } from './from/jeie/NameMap'
import Definition from './lib/items/Definition'
import { ExportDefinition } from './lib/items/DefinitionStore'
import RecipeStore from './lib/recipes/RecipeStore'
import { CountableFunction, createFileLogger, logTreeTo } from './log/logger'
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
  logger: (id: string) => boolean
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

  const store = recipesStore.definitionStore

  for (const def of store.iterate()) {
    assignVisuals(def, nameMap, log)
  }

  console.log('noViewBox :>> ', log.noViewBox.count)
  console.log('noDisplay :>> ', log.noDisplay.count)
  recipesStore.calculate()

  function logger(id: string): boolean {
    let def = store.getById(id)
    if (!def.recipes?.size) return false
    const fileName = id.replace(/[/\\?%*:|"<>]/g, '_')
    const write = createFileLogger(`tree/${fileName}.log`)
    logTreeTo(def, recipesStore.store, write)
    return true
  }
  logger('storagedrawers:upgrade_creative:1')

  return {
    store: store.export(),
    recipes: recipesStore.export(),
    logger,
  }

  function assignVisuals(def: Definition, nameMap: NameMap, log: Loggers) {
    if (def.viewBox && def.display) return
    const hasRecipe = !!def.recipes

    const { source, entry, meta, sNbt } = def

    const attempts: () => IterableIterator<{
      display?: string
      viewBox?: string
    }> = function* () {
      if (sNbt) yield store.getBased(source, entry, meta)
      if (meta !== undefined && meta !== '0')
        yield store.getBased(source, entry)
      yield {
        display:
          nameMap[
            sNbt
              ? `${source}:${entry}:${meta ?? '0'}:${unsignedHash(sNbt)}`
              : def.id
          ]?.en_us,
      }
      yield customRender(source, entry, meta, sNbt, (id: string) =>
        store.getById(id)
      )
    }

    for (const defOther of attempts()) {
      if (def.viewBox && def.display) return
      if (defOther === def) continue
      def.viewBox ??= defOther.viewBox
      def.display ??= defOther.display
    }

    if (!def.display) {
      def.display = `[${def.id}]`
      if (hasRecipe) log.noDisplay(def.id + '\n')
    }

    if (!def.viewBox) {
      def.viewBox = store.getBased('openblocks', 'dev_null')?.viewBox
      if (hasRecipe) log.noViewBox(def.id + '\n')
    }
  }
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
