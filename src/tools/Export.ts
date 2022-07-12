import _ from 'lodash'
import open from 'open'

import { Stack } from '../api'
import CsvRecipe from '../api/CsvRecipe'
import Playthrough from '../api/Playthrough'
import solve from '../api/Solver'
import Stock from '../api/Stock'
import Definition from '../lib/items/Definition'
import DefinitionStore from '../lib/items/DefinitionStore'
import RecipeStore from '../lib/recipes/RecipeStore'
import { escapeCsv } from '../lib/utils'
import { createFileLogger } from '../log/logger'
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
    const playthrough = solve(def, {
      writeLn: (s: string) => write(s + '\n'),
      complLength: (ms: any) =>
        (ms as Stack<Definition>).it.complexity_s.length,
    })
    open(filePath, { wait: true })
    return playthrough
  }

  const playthrough = logger('storagedrawers:upgrade_creative:1', true)
  if (playthrough)
    createFileLogger('data_playthrough.csv')(PlaythroughToCSV(playthrough))

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

function PlaythroughToCSV(pl: Playthrough): string {
  const header = 'Usage,Popularity,Name,ID'
  const uniq = new Stock()

  uniq.maxed(pl.catalysts)
  uniq.add(pl.usages)

  return (
    `${header}\n` +
    _.sortBy(uniq.toArray(), (o) => -o[1])
      .map(([def, v]) =>
        [
          v,
          pl.catalysts.get(def),
          escapeCsv(def.display),
          escapeCsv(def.id),
        ].join(',')
      )
      .join('\n')
  )
}
