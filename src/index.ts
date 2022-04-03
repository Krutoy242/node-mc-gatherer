/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/*=============================================
=                Variables                    =
=============================================*/
import fs from 'fs'
import { join } from 'path'

import exportData, { ExportData } from './Export'
import { NameMap } from './from/JEIExporterTypes'
import append_JECgroups from './from/jec'
import append_JEIExporter from './from/jeiexporter'
import append_JER from './from/jer'
import genOreDictionary from './from/oredict'
import append_viewBoxes from './from/spritesheet'
import DefinitionStore from './lib/DefinitionStore'
import RecipeStore from './lib/RecipeStore'

/*=============================================
=                   Helpers                   =
=============================================*/
function loadText(filename: string): string {
  return fs.readFileSync(filename, 'utf8')
}

/*=============================================
=
=============================================*/

function runTask<T>(opts: {
  description: string
  textSource?: string
  action: (text: string) => T
  fileError?: string
}): T {
  console.log('*️⃣  ' + opts.description)
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

/*=============================================
=
=============================================*/
interface Options {
  /** Minecraft path */
  readonly mc: string
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

  runTask({
    description: 'append_JECgroups',
    textSource: join(
      options.mc,
      '/config/JustEnoughCalculation/data/groups.json'
    ),
    action: (text) => append_JECgroups(recipesStore, dict, text),
  })

  runTask({
    description: 'append_JER',
    textSource: join(options.mc, 'config/jeresources/world-gen.json'),
    action: (text) => append_JER(recipesStore, JSON.parse(text)),
  })

  await runTask({
    description: 'append_JEIExporter',
    action: () => append_JEIExporter(recipesStore, options.mc),
  })

  runTask({
    description: 'append_viewBoxes',
    textSource: 'data/spritesheet.json',
    action: (text) => append_viewBoxes(definitionStore, JSON.parse(text)),
  })

  /*=====  Output parsed data ======*/
  // Remove technical data
  const tooltipMap = runTask({
    description: 'Opening Tooltip map',
    textSource: join(options.mc, 'exports/nameMap.json'),
    action: (text) => JSON.parse(text) as NameMap,
    fileError:
      'tooltipMap.json cant be opened. This file should be created by JEIExporter',
  })

  return exportData(recipesStore, tooltipMap)
}
