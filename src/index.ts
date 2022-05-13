/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/* =============================================
=                Variables                    =
============================================= */
import { join } from 'path'

import chalk from 'chalk'
import glob from 'glob'

import applyCustoms from './custom/customs'
import getTool from './custom/mining_levels'
import { generateBlockMinings } from './from/blockMinings'
import append_fluids, { BlockToFluidMap } from './from/fluids'
import append_JECgroups from './from/jec'
import append_JEIExporter from './from/jeie/JEIExporter'
import getNameMap, { NameMap } from './from/jeie/NameMap'
import append_JER from './from/jer'
import genOreDictionary, { OredictMap } from './from/oredict'
import append_viewBoxes from './from/spritesheet'
import { genToolDurability } from './from/tools'
import Calculator from './lib/calc/Calculator'
import DefinitionStore from './lib/items/DefinitionStore'
import RecipeStore from './lib/recipes/RecipeStore'
import exportData, { ExportData } from './tools/Export'
import CLIHelper from './tools/cli-tools'

export { default as Definition } from './lib/items/Definition'

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
    runTask<number>('Addding JEC recipes', {
      textSource: fromMC('/config/JustEnoughCalculation/data/groups.json'),
      action: (text) => append_JECgroups(recipesStore, text),
      moreInfo: (info) => `Recipes: ${cli.num(info.result)}`,
      '⚠️': chalk`JustEnoughCalculation {green groups.json} not found. Continue without custom JEC recipes.`,
    })

  await runTask('Add custom recipes', {
    action: () => applyCustoms(recipesStore),
    moreInfo: (info) => `Recipes: ${cli.num(info.addedRecs)}`,
  })

  const blockToFluidMap = await runTask<Promise<BlockToFluidMap>>(
    'Add Fluid recipes',
    {
      textSource: glob.sync(fromMC('config/tellme/fluids-csv*.csv'))[0],
      action: (text) => append_fluids(recipesStore, text),
      moreInfo: (info) => `Recipes: ${cli.num(info.addedRecs)}`,
      '⚠️':
        chalk`Tellme file {green fluids-csv.csv} not found. ` +
        chalk`Continue without {green fluid} <=> ` +
        chalk`{green block} recipes.`,
    }
  )

  const crafttweaker_log = runTask<string>('', {
    textSource: fromMC('/crafttweaker.log'),
    '⚠️': chalk`Unable to open {green crafttweaker.log} file. You must load game with installed CraftTweaker and additional provided by gatherer scripts`,
  })

  const blockMinings = runTask('Generate mining levels', {
    action: () => generateBlockMinings(crafttweaker_log),
    moreInfo: (info) =>
      `Added: ${cli.num(Object.keys(info.result ?? {}).length)}`,
    '⚠️': chalk`Block mining levels is unavaliable.`,
  })

  runTask('Append JER recipes', {
    textSource: fromMC('config/jeresources/world-gen.json'),
    action: (text) => append_JER(recipesStore, JSON.parse(text), blockMinings),
    moreInfo: (info) => `Added: ${cli.num(info.addedRecs)}`,
    '⚠️': chalk`Unable to open Just Enough Resources world file {green world-gen.json}. Install mod JER and run world scan.`,
  })

  const nameMap: NameMap | undefined = runTask('Loading Tooltip map', {
    textSource: fromMC('exports/nameMap.json'),
    action: (text) => getNameMap(text),
    moreInfo: (i) => `Loaded: ${cli.num(i.result.info.total)}`,
    '⚠️': chalk`tooltipMap.json cant be opened. This file should be created by JEIExporter. Program would continue anyway`,
  })

  const toolDurability = runTask('Loading Tool durabilities', {
    action: () => genToolDurability(crafttweaker_log),
    moreInfo: (i) => `Tools: ${cli.num(Object.keys(i.result ?? {}).length)}`,
    '⚠️': chalk`Cant find dumped tools. All tools would be consumed entirely.`,
  })

  if (options['jeie'] && nameMap)
    await runTask('Loading JEIExporter\n', {
      action: () =>
        append_JEIExporter(
          nameMap,
          toolDurability,
          (s) => getTool(blockMinings, s),
          recipesStore,
          options.mc,
          cli
        ),
    })

  const oreDict = runTask<OredictMap>('Creating OreDict', {
    textSource: glob.sync(
      fromMC('config/tellme/oredictionary-by-key-individual-csv*.csv')
    )[0],
    action: (text) => genOreDictionary(text),
    moreInfo: (info) =>
      `OreDict size: ${cli.num(Object.keys(info.result).length)}`,
    '⚠️': chalk`Tellme file {green oredictionary-by-key-individual-csv} not found. All oredict recipes would be unknown.`,
  })
  if (oreDict) definitionStore.addOreDict(oreDict)

  // ------------------------
  // Visuals
  // ------------------------

  runTask('Load Spritesheet', {
    textSource: 'data/spritesheet.json',
    action: (text) => append_viewBoxes(definitionStore, JSON.parse(text)),
  })

  await runTask('Assign visuals', {
    action: () => definitionStore.assignVisuals(nameMap, blockToFluidMap),
    moreInfo: (i) =>
      `noDisp: ${cli.num((i.result as any).noDisplay)}, noVB: ${cli.num(
        (i.result as any).noViewBox
      )}`,
  })

  // ------------------------
  // Caclulating
  // ------------------------

  await runTask('Calculate each item\n', {
    action: () =>
      new Calculator(definitionStore, recipesStore.store).compute(cli),
    moreInfo: (info) => `\nAdded: ${cli.num(info.result as any)}`,
  })

  const exported = runTask('Exporting data.json\n', {
    action: () => exportData(recipesStore),
  }) as ExportData

  return exported
}
