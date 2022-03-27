/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/*=============================================
=                Variables                    =
=============================================*/
import fs from 'fs'
import path from 'path'

import { exportAdditionals } from './additionalsStore'
import { parseJECgroups } from './from/jec'
import { parse_JER } from './from/jer'
import { parseSpritesheet } from './from/spritesheet'
import { parseCrafttweakerLog_raw } from './from/crafttweaker_raw_log'
import { applyOreDictionary } from './from/crafttweaker_log'

import yargs from 'yargs'
const argv = yargs(process.argv.slice(2))
  .options({
    mc: {
      alias: 'm',
      type: 'string',
      describe: 'Path to minecraft folder',
      demandOption: true,
      // "D:/mc_client/Instances/Enigmatica2Expert - Extended/"
    },
    sprite: {
      alias: 's',
      type: 'string',
      describe: 'Input sprite path',
      demandOption: true,
      // "D:\MEGA_LD-LocksTO\CODING\Minecraft\CraftTreeVisualizer\src\assets\raw\spritesheet.json"
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

/*=============================================
=                   Helpers                   =
=============================================*/
function loadText(filename: string): string {
  return fs.readFileSync(path.resolve(__dirname, filename), 'utf8')
}

function loadJson(filename: string) {
  return JSON.parse(loadText(filename))
}

function saveText(txt: string, filename: string) {
  fs.writeFileSync(path.resolve(__dirname, filename), txt)
}

function saveObjAsJson(obj: any, filename: string) {
  saveText(JSON.stringify(obj, null, 2), filename)
}

/*=============================================
=            Spritesheet
=============================================*/
parseSpritesheet(loadJson(argv.sprite))

/*=============================================
=            crafttweaker.log
=============================================*/
const crafttweakerLogTxt = loadText(argv.mc + '/crafttweaker.log')
applyOreDictionary(crafttweakerLogTxt)
parseCrafttweakerLog_raw(loadText(argv.mc + '/crafttweaker_raw.log'))

/*=============================================
=            world-gen.json
=============================================*/
parse_JER(loadJson(argv.mc + 'config/jeresources/world-gen.json'))

/*=============================================
=      Prepare JEC groups.json
=============================================*/
parseJECgroups(loadText(argv.mc + '/config/JustEnoughCalculation/data/groups.json'))

/*=====  Save parsed data ======*/
// Remove technical data
saveObjAsJson(exportAdditionals(), argv.output)
