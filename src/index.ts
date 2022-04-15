/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/* =============================================
=                Variables                    =
============================================= */
import fs from 'fs'
import { join } from 'path'

import chalk from 'chalk'
import glob from 'glob'

import exportData, { ExportData } from './Export'
import append_JECgroups from './from/jec'
import append_JEIExporter from './from/jeie/JEIExporter'
import getNameMap, { NameMap } from './from/jeie/NameMap'
import append_JER from './from/jer'
import genOreDictionary from './from/oredict'
import append_viewBoxes from './from/spritesheet'
import DefinitionStore from './lib/items/DefinitionStore'
import Stack from './lib/items/Stack'
import RecipeStore from './lib/recipes/RecipeStore'

/* =============================================
=                   Helpers                   =
============================================= */
function loadText(filename: string): string {
  return fs.readFileSync(filename, 'utf8')
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
  console.log(' ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
  const definitionStore = new DefinitionStore()
  const recipesStore = new RecipeStore(definitionStore)
  const fromMC = (filePath: string) => join(options.mc, filePath)
  const runTask = createRunTask(definitionStore, recipesStore)

  // Init Crafting Table as first item
  definitionStore.getById('minecraft:crafting_table:0')

  const crafttweaker_log: string = runTask({
    textSource: fromMC('/crafttweaker.log'),
    fileError: 'Unable to open crafttweaker.log file',
  })

  if (options['jec'])
    runTask({
      description: 'Addding JEC recipes',
      textSource: fromMC('/config/JustEnoughCalculation/data/groups.json'),
      action: (text) => append_JECgroups(recipesStore, text),
      moreInfo: (info) => `Added recipes: ${chalk.green(info.result)}`,
    })

  const adapters = await Promise.all(
    glob
      .sync('src/custom/recipes/**/*.ts')
      .map((filePath) => import('./' + filePath.substring(4)))
  )
  runTask({
    description: 'Add custom recipes',
    action: () =>
      adapters.map((modModule) =>
        modModule.default(
          (
            recipe_source: string,
            outputs: string | string[],
            inputs?: string | string[],
            catalysts?: string | string[]
          ) =>
            recipesStore.addRecipe(
              recipe_source,
              shortToStack(outputs),
              shortToStack(inputs),
              shortToStack(catalysts)
            )
        )
      ),
    moreInfo: (info) => `Added recipes: ${chalk.green(info.addedRecs)}`,
  })
  function shortToStack(short?: string[] | string): Stack[] | undefined {
    if (!short) return
    return [short]
      .flat()
      .map((str) => Stack.fromString(str, (s) => definitionStore.getById(s)))
  }

  runTask({
    description: 'Append JER recipes',
    textSource: fromMC('config/jeresources/world-gen.json'),
    action: (text) =>
      append_JER(recipesStore, JSON.parse(text), crafttweaker_log),
    moreInfo: (info) => `Added: ${chalk.green(info.addedRecs)}`,
  })

  const nameMap: NameMap = runTask({
    description: 'Loading Tooltip map',
    textSource: fromMC('exports/nameMap.json'),
    action: (text) => getNameMap(text),
    moreInfo: (i) => `Loaded: ${chalk.green(i.result.info.total)}`,
    fileError:
      'tooltipMap.json cant be opened. ' +
      'This file should be created by JEIExporter',
  })

  if (options['jeie'])
    await runTask({
      description: 'Loading JEIExporter\n',
      action: () => append_JEIExporter(nameMap, recipesStore, options.mc),
    })

  runTask({
    description: 'Load Spritesheet',
    textSource: 'data/spritesheet.json',
    action: (text) => append_viewBoxes(definitionStore, JSON.parse(text)),
  })

  const oreDict = runTask({
    description: 'Creating OreDict',
    action: () => genOreDictionary(crafttweaker_log),
    moreInfo: (info) =>
      `OreDict size: ${chalk.green(Object.keys(info.result).length)}`,
  })
  definitionStore.addOreDict(oreDict)

  runTask({
    description: 'Assign visuals',
    action: () => definitionStore.assignVisuals(nameMap),
  })

  runTask({
    description: 'Calculate each item',
    action: () => recipesStore.calculate(),
  })

  return exportData(recipesStore)
}

/* =============================================
=
============================================= */

function logTask(text: string) {
  process.stdout.write('*️⃣  ' + text.padEnd(22))
}
function logMore(text: string) {
  process.stdout.write(chalk.gray(text))
}

function createRunTask(
  definitionStore: DefinitionStore,
  recipesStore: RecipeStore
) {
  return function runTask<T>(opts: {
    description?: string
    moreInfo?: (info: {
      addedDefs: number
      addedRecs: number
      result: T
    }) => string
    textSource?: string
    action?: (text: string) => T
    fileError?: string
  }): T {
    if (opts.description) logTask(opts.description)
    let text = ''
    if (opts.textSource)
      try {
        text = loadText(opts.textSource)
      } catch (err: unknown) {
        console.error(`🛑  Error at task: ${opts.fileError}`)
        throw new Error('Unable to complete task')
      }

    const oldDefs = definitionStore.size
    const oldRecs = recipesStore.size()
    const result = (opts.action ?? ((t: any) => t as T))(text)

    if (opts.moreInfo) {
      const info = {
        addedDefs: definitionStore.size - oldDefs,
        addedRecs: recipesStore.size() - oldRecs,
        result,
      }
      logMore(opts.moreInfo(info))
    }

    if (opts.description) process.stdout.write('\n')
    return result
  }
}
