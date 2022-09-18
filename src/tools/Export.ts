import _, { sortBy } from 'lodash'

import type { CsvRecipe } from '../api'
import { recipeSorter, solveLog } from '../api'

import type Playthrough from '../api/Playthrough'
import { getVolume } from '../api/volume'
import type Definition from '../lib/items/Definition'
import type DefinitionStore from '../lib/items/DefinitionStore'
import type RecipeStore from '../lib/recipes/RecipeStore'
import { escapeCsv } from '../lib/utils'
import { createFileLogger } from '../log/logger'

export interface ExportData {
  store: DefinitionStore
  recipes: CsvRecipe[]
  oreDict: { [entry: string]: string[] }
  logger: (id: string) => Playthrough<Definition> | undefined
}

export default function exportData(recipesStore: RecipeStore): ExportData {
  const store = recipesStore.definitionStore

  function logger(
    id: string,
    idPath = false
  ): Playthrough<Definition> | undefined {
    let isAscend = false
    if (id.startsWith('from ')) {
      id = id.replace(/^from /, '')
      isAscend = true
    }

    const def = store.lookById(id)
    if (!def) return

    const fileName = idPath ? id.replace(/[/\\?%*:|"<>]/g, '_') : 'tmp'
    const write = createFileLogger(`tree/${fileName}.log`)
    const writeLn = (s: string) => write(`${s}\n`)

    const playthrough = solveLog<Definition, [number, number]>(def, [0, 1], (def, combined, _a, tab, complexityPad) => {
      writeLn('  '.repeat(tab) + def.toString({ complexityPad }))
      if (!combined) return

      if (!isAscend) {
        (!def.mainRecipe && def.purity < 1
          // ? [...def.recipes ?? []]
          ? [...def.recipes ?? []].sort(recipeSorter)[0]
          : def.mainRecipe
        )?.toString().split('\n')
          .forEach(line => writeLn(`${'  '.repeat(tab)}  ${line}`))
      }

      return [tab + 1, Math.max(...combined.map(it => it[0].complexity_s.length))]
    }, isAscend)
    return playthrough
  }

  // Output tree to creative vending
  const playthrough = logger('storagedrawers:upgrade_creative:1', true)
  if (playthrough) createFileLogger('playthrough.csv')(PlaythroughToCSV(playthrough))

  // Output tree from diamond
  logger('from minecraft:diamond:0', true)

  const mostStepsDef = [...store].sort(
    (a, b) =>
      (b.mainRecipe?.inventory?.steps ?? 0)
        - (a.mainRecipe?.inventory?.steps ?? 0) || b.complexity - a.complexity
  )[0]

  logger(mostStepsDef.id, true)

  return {
    store,
    recipes: recipesStore.export(),
    oreDict: _(store.oreDict)
      .pickBy(l => typeof l[0] !== 'string' && l.length > 1)
      .mapValues(defs => defs.map(d => (d as Definition).id))
      .value(),
    logger,
  }
}

function PlaythroughToCSV(pl: Playthrough<Definition>): string {
  const header = 'Usage,Popularity,Name,ID'

  return (
    `${header}\n${
    sortBy(
      pl
        .getMerged()
        .toArray()
        .map(([def, v]) => {
          const [vol, unit] = getVolume(def)
          return [def, v / vol, unit] as const
        }),
      o => -o[1]
    )
      .map(([def, v, unit]) =>
        [
          `${v}${unit ?? ''}`,
          pl.getCatalyst(def),
          escapeCsv(def.display),
          escapeCsv(def.id),
        ].join(',')
      )
      .join('\n')}`
  )
}
