/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/*=============================================
=                Variables                    =
=============================================*/
import fs from 'fs'
import { join } from 'path'

import { append_JECgroups } from './from/jec'
import { append_JER } from './from/jer'
import { append_viewBoxes } from './from/spritesheet'
import { append_DisplayNames } from './from/crafttweaker_raw_log'
import { append_oreDicts } from './from/crafttweaker_log'
import { RawAdditionalsStore } from './types'
import PrimalRecipesHelper from './primal_recipes'

export * from './types'

/*=============================================
=                   Helpers                   =
=============================================*/
function loadText(filename: string): string {
  return fs.readFileSync(filename, 'utf8')
}

function loadJson(filename: string) {
  return JSON.parse(loadText(filename))
}

/*=============================================
=
=============================================*/
interface Options {
  /** Minecraft path */
  mc: string

  /** Sprite loading path */
  sprite: string
}

export default function mcGather(options: Options): RawAdditionalsStore {
  const storeHelper = new PrimalRecipesHelper()

  // Init Crafting Table as first item
  storeHelper.BH('minecraft:crafting_table')

  append_viewBoxes(storeHelper, loadJson(options.sprite))
  append_oreDicts(storeHelper, loadText(join(options.mc, '/crafttweaker.log')))
  append_DisplayNames(storeHelper, loadText(join(options.mc, '/crafttweaker_raw.log')))
  append_JER(storeHelper, loadJson(join(options.mc, 'config/jeresources/world-gen.json')))
  append_JECgroups(storeHelper, loadText(join(options.mc, '/config/JustEnoughCalculation/data/groups.json')))

  /*=====  Output parsed data ======*/
  // Remove technical data
  return storeHelper.exportAdditionals()
}
