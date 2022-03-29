#! /usr/bin/env node

import fs from 'fs'

import yargs from 'yargs'

import mcGather from '.'
const argv = yargs(process.argv.slice(2))
  .options({
    mc: {
      alias: 'm',
      type: 'string',
      describe: 'Path to minecraft folder',
      demandOption: true,
    },
    sprite: {
      alias: 's',
      type: 'string',
      describe: 'Input sprite path',
      demandOption: true,
    },
    output: {
      alias: 'o',
      type: 'string',
      describe: 'Output resulting json path',
      default: 'default_additionals.json',
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

saveObjAsJson(mcGather(argv), argv.output)
