#! /usr/bin/env node

import fs from 'fs'
import { join } from 'path'

import yargs from 'yargs'

import make_sprite from './make_sprite'

import mcGather from '.'

const argv = yargs(process.argv.slice(2))
  .options({
    mc: {
      alias: 'm',
      type: 'string',
      describe: 'Path to minecraft folder',
    },
    output: {
      alias: 'o',
      type: 'string',
      describe: 'Output dir path',
      default: '.',
    },
    icons: {
      alias: 'i',
      type: 'string',
      describe: 'If specified, generate spritesheet .png and .json',
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

if (argv.icons) make_sprite(argv.icons, argv.output)
else {
  if (!argv.mc) throw new Error('Arguments must include --mc')
  saveObjAsJson(mcGather(argv as any), join(argv.output, 'data.json'))
}
