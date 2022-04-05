/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/* =============================================
=                Variables                    =
============================================= */
import fs from 'fs'
import { join } from 'path'

import glob from 'glob'

import exportData, { ExportData } from './Export'
import { NameMap } from './from/JEIExporterTypes'
import append_JECgroups from './from/jec'
import append_JEIExporter from './from/jeiexporter'
import append_JER from './from/jer'
import genOreDictionary from './from/oredict'
import append_viewBoxes from './from/spritesheet'
import DefinitionStore from './lib/DefinitionStore'
import RecipeStore from './lib/RecipeStore'

/* =============================================
=                   Helpers                   =
============================================= */
function loadText(filename: string): string {
  return fs.readFileSync(filename, 'utf8')
}

/* =============================================
=
============================================= */

function logTask(desc: string) {
  console.log('*️⃣  ' + desc)
}

function runTask<T>(opts: {
  description: string
  textSource?: string
  action: (text: string) => T
  fileError?: string
}): T {
  logTask(opts.description)
  let text = ''
  if (opts.textSource)
    try {
      text = loadText(opts.textSource)
    } catch (err: unknown) {
      console.error(`🛑  Error at task: ${opts.fileError}`)
      throw new Error('Unable to complete task')
    }
  return opts.action(text)
}

/* =============================================
=
============================================= */
interface Options {
  /** Minecraft path */
  readonly mc: string

  readonly jeie: boolean
  readonly jec: boolean
}

export default async function mcGather(options: Options): Promise<ExportData> {
  console.log('*️⃣ Initializing')
  const definitionStore = new DefinitionStore()
  const recipesStore = new RecipeStore(definitionStore)

  // Init Crafting Table as first item
  definitionStore.get('minecraft:crafting_table:0')

  const dict = runTask({
    description: 'append_oreDicts',
    textSource: join(options.mc, '/crafttweaker.log'),
    action: genOreDictionary,
  })

  if (options['jec'])
    runTask({
      description: 'append_JECgroups',
      textSource: join(
        options.mc,
        '/config/JustEnoughCalculation/data/groups.json'
      ),
      action: (text) => append_JECgroups(recipesStore, dict, text),
    })

  logTask('Add custom recipes')
  ;(
    await Promise.all(
      glob
        .sync('src/adapters/recipes/**/*.ts')
        .map((filePath) => import('./' + filePath.substring(4)))
    )
  ).map((modl) =>
    modl.default(
      (s: string) => recipesStore.forCategory(s),
      (s: string, n?: number) => recipesStore.BH(s, n)
    )
  )

  runTask({
    description: 'append_JER',
    textSource: join(options.mc, 'config/jeresources/world-gen.json'),
    action: (text) => append_JER(recipesStore, JSON.parse(text)),
  })

  const tooltipMap = runTask({
    description: 'Opening Tooltip map',
    textSource: join(options.mc, 'exports/nameMap.json'),
    action: (text) => JSON.parse(text) as NameMap,
    fileError:
      'tooltipMap.json cant be opened. This file should be created by JEIExporter',
  })

  if (options['jeie'])
    await runTask({
      description: 'append_JEIExporter',
      action: () => append_JEIExporter(tooltipMap, recipesStore, options.mc),
    })

  runTask({
    description: 'append_viewBoxes',
    textSource: 'data/spritesheet.json',
    action: (text) => append_viewBoxes(definitionStore, JSON.parse(text)),
  })

  /* =====  Output parsed data ====== */
  // Remove technical data

  return exportData(recipesStore, tooltipMap)
}
