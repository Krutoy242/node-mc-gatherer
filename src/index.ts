/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

import type CLIHelper from './tools/cli-tools'

import type { ExportData } from './tools/Export'
import { join } from 'node:path'

import chalk from 'chalk'
import { parse as csvParseSync } from 'csv-parse/sync'
import fast_glob from 'fast-glob'
import { IngredientStore } from './api/IngredientStore'
import applyCustoms from './custom/customs'
import getMiningPlaceholder from './custom/mining_levels'
import { generateBlockMinings } from './from/blockMinings'
import append_fluids from './from/fluids'
import append_JECgroups from './from/jec'
import append_JEIExporter from './from/jeie/JEIExporter'
import getNameMap from './from/jeie/NameMap'
import append_JER from './from/jer'
import genOreDictionary from './from/oredict'
import { genToolDurability } from './from/tools'
import Calculator from './lib/calc/Calculator'
import Definition from './lib/items/Definition'
import DefinitionStore from './lib/items/DefinitionStore'
import hardReplaceMap from './lib/items/HardReplace'
import RecipeStore from './lib/recipes/RecipeStore'
import exportData from './tools/Export'

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
  cli: CLIHelper,
): Promise<ExportData> {
  const definitionStore = new DefinitionStore(
    (...args) => new Definition(...args),
    hardReplaceMap,
  )
  const ingredientStore = new IngredientStore(definitionStore.getById)
  const recipesStore = new RecipeStore(definitionStore, ingredientStore)
  const runTask = cli.createRunTask(definitionStore, recipesStore)
  const fromMC = (f: string) => join(options.mc, f)
  const fromTellme = (f: string) => fast_glob.sync(fromMC(`config/tellme/${f}*.csv`).replace(/\\/g, '/')).pop() ?? null

  // Init Crafting Table as first item
  definitionStore.getById('minecraft:crafting_table:0')

  // ------------------------
  // Recipes
  // ------------------------
  const oreDict = runTask('Creating OreDict', {
    'textSource': fromTellme('oredictionary-by-key-individual-csv'),
    'action': text => genOreDictionary(text),
    'moreInfo': info => info.result ? `OreDict size: ${cli.num(Object.keys(info.result).length)}` : '',
    '⚠️': chalk`Tellme file {green oredictionary-by-key-individual-csv} not found. All oredict recipes would be unknown.`,
  })
  if (oreDict)
    definitionStore.addOreDict(oreDict)

  if (options.jec) {
    runTask('Addding JEC recipes', {
      'textSource': fromMC('/config/JustEnoughCalculation/data/groups.json'),
      'action': text => append_JECgroups(recipesStore, text),
      'moreInfo': info => `Recipes: ${cli.num(info.result)}`,
      '⚠️': chalk`JustEnoughCalculation {green groups.json} not found. Continue without custom JEC recipes.`,
    })
  }

  const modMap = runTask('Loading mod list', {
    'textSource': fromTellme('mod-list-csv'),
    'action': text => Object.fromEntries(
      (csvParseSync(text, { columns: !0 }) as { ModID: string }[])
        .map(l => [l.ModID, true]),
    ),
    'moreInfo': info => info.result ? `Mods: ${cli.num(Object.keys(info.result).length)}` : '',
    '⚠️': chalk`Tellme file {green mod-list-csv} not found. Custom recipes for ALL MODS would be added.`,
  })

  await runTask('Add custom recipes', {
    action: () => applyCustoms(recipesStore, modMap),
    moreInfo: info => `Recipes: ${cli.num(info.addedRecs)}`,
  })

  const blockToFluidMap = await runTask('Add Fluid recipes', {
    'textSource': fromTellme('fluids-csv'),
    'action': text => append_fluids(recipesStore, text),
    'moreInfo': info => `Recipes: ${cli.num(info.addedRecs)}`,
    '⚠️':
        chalk`Tellme file {green fluids-csv.csv} not found. `
        + chalk`Continue without {green fluid} <=> `
        + chalk`{green block} recipes.`,
  })

  const crafttweaker_log = runTask<string>('', {
    'textSource': fromMC('/crafttweaker.log'),
    '⚠️': chalk`Unable to open {green crafttweaker.log} file. You must load game with installed CraftTweaker and additional provided by gatherer scripts`,
  })

  const blockMinings = runTask('Generate mining levels', {
    'action': () => generateBlockMinings(crafttweaker_log),
    'moreInfo': info => `Added: ${cli.num(Object.keys(info.result ?? {}).length)}`,
    '⚠️': chalk`Block mining levels is unavaliable. Inject {bold .zs} files by run `
      + chalk`{bgGray mc-gatherer --inject --mc="path/to/modpack"}`,
  })

  runTask('Append JER recipes', {
    'textSource': fromMC('config/jeresources/world-gen.json'),
    'action': text => append_JER(recipesStore, JSON.parse(text), blockMinings),
    'moreInfo': info => `Added: ${cli.num(info.addedRecs)}`,
    '⚠️': chalk`Unable to open Just Enough Resources world file {green world-gen.json}. Install mod JER and run world scan.`,
  })

  const nameMap = runTask('Loading Tooltip map', {
    'textSource': fromMC('exports/nameMap.json'),
    'action': text => getNameMap(text),
    'moreInfo': i => `Loaded: ${cli.num(i.result.info.total)}`,
    '⚠️': chalk`tooltipMap.json cant be opened. This file should be created by JEIExporter. Program would continue anyway`,
  })

  const toolDurability = runTask('Loading Tool durabs', {
    'action': genToolDurability,
    'moreInfo': i => `Tools: ${cli.num(Object.keys(i.result ?? {}).length)}`,
    '⚠️': chalk`Cant find dumped tools. All tools would be consumed entirely.`,
  })

  if (options.jeie && nameMap) {
    await runTask('Loading JEIExporter\n', {
      action: () =>
        append_JEIExporter(
          nameMap,
          toolDurability,
          s => getMiningPlaceholder(blockMinings, s),
          recipesStore,
          options.mc,
          cli,
        ),
    })
  }

  // ------------------------
  // Visuals
  // ------------------------
  await runTask('Assign visuals', {
    action: () => definitionStore.assignVisuals(nameMap, blockToFluidMap),
    moreInfo: i =>
      `noDisp: ${cli.num(i.result.noDisplay)}, noVB: ${cli.num(
        i.result.noImgsrc,
      )}`,
  })

  // ------------------------
  // Caclulating
  // ------------------------

  await runTask('Calculate each item\n', {
    action: () =>
      new Calculator(
        definitionStore,
        recipesStore.store,
        ingredientStore,
      ).compute(cli),
    moreInfo: info => `\nAdded: ${cli.num(info.result as any)}`,
  })

  const exported = runTask('Exporting data.json\n', {
    action: () => exportData(recipesStore),
  }) as ExportData

  return exported
}
