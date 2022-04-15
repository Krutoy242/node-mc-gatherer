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

export default function exportData(recipesStore: RecipeStore): ExportData {
  const store = recipesStore.definitionStore

  function logger(id: string): boolean {
    let def = store.getById(id)
    const fileName = id.replace(/[/\\?%*:|"<>]/g, '_')
    const write = createFileLogger(`tree/${fileName}.log`)
    logTreeTo(def, recipesStore, write)
    return true
  }
  logger('storagedrawers:upgrade_creative:1')

  return {
    store: store.export(),
    recipes: recipesStore.export(),
    logger,
  }
}
