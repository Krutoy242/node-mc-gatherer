/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/* =============================================
=                Variables                    =
============================================= */
import { join } from 'path'

import chalk from 'chalk'

import applyCustoms from './custom/customs'
import append_JECgroups from './from/jec'
import append_JEIExporter from './from/jeie/JEIExporter'
import getNameMap, { NameMap } from './from/jeie/NameMap'
import append_JER from './from/jer'
import genOreDictionary from './from/oredict'
import append_viewBoxes from './from/spritesheet'
import Calculator from './lib/calc/Calculator'
import DefinitionStore from './lib/items/DefinitionStore'
import RecipeStore from './lib/recipes/RecipeStore'
import exportData, { ExportData } from './tools/Export'
import CLIHelper from './tools/cli-tools'

/* =============================================
=
============================================= */
interface Options {
  /** Minecraft path */
  readonly mc: string

  readonly jeie: boolean
  readonly jec: boolean
}

export default async function mcGather(
  options: Options,
  cli: CLIHelper
): Promise<ExportData> {
  const definitionStore = new DefinitionStore()
  const recipesStore = new RecipeStore(definitionStore)
  const runTask = cli.createRunTask(definitionStore, recipesStore)
  const fromMC = (filePath: string) => join(options.mc, filePath)

  // Init Crafting Table as first item
  definitionStore.getById('minecraft:crafting_table:0')

  // ------------------------
  // Recipes
  // ------------------------

  if (options['jec'])
    runTask<number>({
      description: 'Addding JEC recipes',
      textSource: fromMC('/config/JustEnoughCalculation/data/groups.json'),
      action: (text) => append_JECgroups(recipesStore, text),
      moreInfo: (info) => `Recipes: ${cli.num(info.result)}`,
    })

  await runTask({
    description: 'Add custom recipes',
    action: () => applyCustoms(recipesStore),
    moreInfo: (info) => `Recipes: ${cli.num(info.addedRecs)}`,
  })

  const crafttweaker_log: string = runTask({
    textSource: fromMC('/crafttweaker.log'),
    fileError: 'Unable to open crafttweaker.log file',
  })

  runTask({
    description: 'Append JER recipes',
    textSource: fromMC('config/jeresources/world-gen.json'),
    action: (text) =>
      append_JER(recipesStore, JSON.parse(text), crafttweaker_log),
    moreInfo: (info) => `Added: ${cli.num(info.addedRecs)}`,
  })

  const nameMap: NameMap = runTask({
    description: 'Loading Tooltip map',
    textSource: fromMC('exports/nameMap.json'),
    action: (text) => getNameMap(text),
    moreInfo: (i) => `Loaded: ${cli.num(i.result.info.total)}`,
    fileError:
      'tooltipMap.json cant be opened. ' +
      'This file should be created by JEIExporter',
  })

  if (options['jeie'])
    await runTask({
      description: 'Loading JEIExporter\n',
      action: () => append_JEIExporter(nameMap, recipesStore, options.mc, cli),
    })

  // ------------------------
  // Visuals
  // ------------------------

  runTask({
    description: 'Load Spritesheet',
    textSource: 'data/spritesheet.json',
    action: (text) => append_viewBoxes(definitionStore, JSON.parse(text)),
  })

  runTask({
    description: 'Assign visuals',
    action: () => definitionStore.assignVisuals(nameMap),
    moreInfo: (i) =>
      `noDisp: ${cli.num(i.result.noDisplay)}, noVB: ${cli.num(
        i.result.noViewBox
      )}`,
  })

  // ------------------------
  // Caclulating
  // ------------------------

  definitionStore.addOreDict(
    runTask({
      description: 'Creating OreDict',
      action: () => genOreDictionary(crafttweaker_log),
      moreInfo: (info) =>
        `OreDict size: ${cli.num(Object.keys(info.result).length)}`,
    })
  )

  await runTask({
    description: 'Calculate each item\n',
    action: () =>
      new Calculator(definitionStore, recipesStore.store).compute(cli),
    moreInfo: (info) => `\nAdded: ${cli.num(info.result as any)}`,
  })

  const exported = runTask({
    description: 'Exporting data.json\n',
    action: () => exportData(recipesStore),
  })

  return exported
}
