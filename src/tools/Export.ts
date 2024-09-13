import _ from 'lodash'

import type { CsvRecipe } from '../api'
import { solve } from '../api'

import type Playthrough from '../api/Playthrough'
import { getVolume } from '../api/volume'
import type Definition from '../lib/items/Definition'
import type DefinitionStore from '../lib/items/DefinitionStore'
import type RecipeStore from '../lib/recipes/RecipeStore'
import { escapeCsv, sortBy } from '../lib/utils'
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
    idPath = false,
  ): Playthrough<Definition> | undefined {
    let isAscend = false
    if (id.startsWith('from ')) {
      id = id.replace(/^from /, '')
      isAscend = true
    }

    const def = store.lookById(id)
    if (!def)
      return

    const fileName = idPath ? id.replace(/[/\\?%*:|"<>]/g, '_') : 'tmp'
    const write = createFileLogger(`tree/${fileName}.log`)
    const writeLn = (s: string) => write(`${s}\n`)

    const playthrough = solve<Definition, [number, number]>(def, isAscend, (def, combined, amountOrBehind, tab, complexityPad) => {
      writeLn('  '.repeat(tab) + def.toString({ complexityPad }))
      if (!combined)
        return

      const amoutOfOutput = typeof amountOrBehind === 'number' ? amountOrBehind : 1

      if (!isAscend) {
        (def.recipes ? def.bestRecipe(amoutOfOutput)?.[0] : undefined)?.toString().split('\n')
          .forEach(line => writeLn(`${'  '.repeat(tab)}  ${line}`))
      }

      const newComplexityPad = Math.max(...combined.map(it => it[0].complexity_s.length))
      return [tab + 1, newComplexityPad]
    }, [0, 1])
    return playthrough
  }

  // Output tree to creative vending
  const playthrough = logger('storagedrawers:upgrade_creative:1', true)
  if (playthrough)
    createFileLogger('playthrough.csv')(PlaythroughToCSV(playthrough))

  // Output tree from diamond
  logger('from minecraft:diamond:0', true)

  const mostStepsDef = [...store].sort(
    (a, b) =>
      (b.mainRecipe?.inventory?.steps ?? 0)
      - (a.mainRecipe?.inventory?.steps ?? 0) || b.complexity - a.complexity,
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

function PlaythroughToCSV(playthrough: Playthrough<Definition>): string {
  const header = 'Usage,Popularity,Name,ID'

  return (
    `${header}\n${
    sortBy(
      playthrough
        .getMerged()
        .toArray()
        .map(([def, v]) => {
          const [vol, unit] = getVolume(def)
          return [def, v / vol, unit] as const
        }),
      o => -o[1],
    )
      .map(([def, v, unit]) =>
        [
          `${v}${unit ?? ''}`,
          playthrough.getCatalyst(def),
          escapeCsv(def.display),
          escapeCsv(def.id),
        ].join(','),
      )
      .join('\n')}`
  )
}
