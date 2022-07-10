import open from 'open'

import CsvRecipe from '../api/CsvRecipe'
import DefinitionStore from '../lib/items/DefinitionStore'
import RecipeStore from '../lib/recipes/RecipeStore'
import Playthrough from '../log/Playthrough'
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
  recipes: CsvRecipe[]
  logger: (id: string) => Playthrough | undefined
}

export default function exportData(recipesStore: RecipeStore): ExportData {
  const store = recipesStore.definitionStore

  function logger(id: string, idPath = false): Playthrough | undefined {
    let def = store.lookById(id)
    if (!def) return

    const fileName = idPath ? id.replace(/[/\\?%*:|"<>]/g, '_') : 'tmp'
    const filePath = `tree/${fileName}.log`
    const write = createFileLogger(filePath)
    const playthrough = logTreeTo(def, write)
    open(filePath, { wait: true })
    return playthrough
  }

  const playthrough = logger('storagedrawers:upgrade_creative:1', true)
  if (playthrough) createFileLogger('data_playthrough.csv')(playthrough.toCSV())

  const mostStepsDef = [...store].sort(
    (a, b) =>
      (b.mainRecipe?.inventory?.steps ?? 0) -
        (a.mainRecipe?.inventory?.steps ?? 0) || b.complexity - a.complexity
  )[0]

  logger(mostStepsDef.id)

  return {
    store,
    recipes: recipesStore.export(),
    logger,
  }
}
