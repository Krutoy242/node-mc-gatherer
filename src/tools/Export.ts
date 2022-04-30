import open from 'open'

import DefinitionStore from '../lib/items/DefinitionStore'
import RecipeStore from '../lib/recipes/RecipeStore'
import { createFileLogger, logTreeTo } from '../log/logger'
// import { StackDef } from './lib/Stack'

export interface ExportEntry {
  id: string
  viewBox?: string
  display?: string
  recipes?: Set<number>
}

export interface ExportData {
  store: DefinitionStore
  recipes: {
    outputs: string[]
    inputs?: string[]
    catalysts?: string[]
  }[]
  logger: (id: string) => boolean
}

export default function exportData(recipesStore: RecipeStore): ExportData {
  const store = recipesStore.definitionStore

  function logger(id: string, idPath = false): boolean {
    let def = store.lookById(id)
    if (!def) return false
    const fileName = idPath ? id.replace(/[/\\?%*:|"<>]/g, '_') : 'tmp'
    const filePath = `tree/${fileName}.log`
    const write = createFileLogger(filePath)
    logTreeTo(def, write)
    open(filePath, { wait: true })
    return true
  }

  logger('storagedrawers:upgrade_creative:1', true)
  logger(
    [...store.iterate()].sort(
      (a, b) =>
        (b.mainRecipe?.inventory?.steps ?? 0) -
          (a.mainRecipe?.inventory?.steps ?? 0) || b.complexity - a.complexity
    )[0].id,
    true
  )

  return {
    store,
    recipes: recipesStore.export(),
    logger,
  }
}
