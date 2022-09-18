#! /usr/bin/env node

import fs from 'fs'
import { join } from 'path'

import { terminal as term } from 'terminal-kit'
import yargs from 'yargs'

import type { ExportData } from './tools/Export'
import CLIHelper from './tools/cli-tools'

import mcGather from '.'

const argv = yargs(process.argv.slice(2))
  .options({
    mc: {
      alias   : 'm',
      type    : 'string',
      describe: 'Path to minecraft folder',
    },
    output: {
      alias   : 'o',
      type    : 'string',
      describe: 'Output dir path',
      default : '.',
    },
    jeie: {
      type    : 'boolean',
      describe: 'Do load JEIExporter files',
      default : true,
    },
    jec: {
      type    : 'boolean',
      describe: 'Do load Just Enough Calculation files',
      default : true,
    },
    inject: {
      alias   : 'j',
      type    : 'boolean',
      describe: 'Inject .zs script files into minecraft folder',
    },
  })
  .version(false)
  .help('h')
  .wrap(null)
  .parseSync()

function saveText(txt: string, filename: string) {
  fs.writeFileSync(filename, txt)
}

function saveObjAsJson(obj: any, filename: string) {
  saveText(JSON.stringify(obj, null, 2), filename)
}

if (!argv.mc) throw new Error('Arguments must include --mc')
;(async () => {
  const cli = new CLIHelper()
  const exportData = await mcGather(argv as any, cli)
  saveData(exportData)
  await prompt(exportData)
  term.processExit(0)
})()

function saveData(exportData: ExportData) {
  saveText(exportData.store.csv(), join(argv.output, 'data_items.csv'))
  saveObjAsJson(exportData.recipes, join(argv.output, 'data_recipes.json'))
  saveObjAsJson(exportData.oreDict, join(argv.output, 'data_oredict.json'))
}

async function prompt(exportData: ExportData) {
  term.bgGray('Input item id you want to generate recipes for:')
  term('\n')

  const keys = Object.keys(exportData.store)

  let id: string | undefined
  do {
    id = await term.inputField({
      autoComplete: async (input: string) =>
        !input ? '' : keys.find(k => k.startsWith(input)) ?? input,
      autoCompleteHint: true,
    }).promise
    term('\n')
    if (id) {
      if (!exportData.logger(id)) term.red('This id doesn\'t exist')('\n')
      else term.green('Succes!')('\n')
    }
  } while (id)
}
