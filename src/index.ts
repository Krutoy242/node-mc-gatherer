/*
Helper script to prepare several files for fast acces
Lunch with NodeJS
*/

/*=============================================
=                Variables                    =
=============================================*/
import fs from 'fs'
import { join } from 'path'

import { append_oreDicts } from './from/crafttweaker_log'
import { append_DisplayNames } from './from/crafttweaker_raw_log'
import { append_JECgroups } from './from/jec'
import { append_JER } from './from/jer'
import { append_viewBoxes } from './from/spritesheet'
import PrimalRecipesHelper from './primal_recipes'
import { RawAdditionalsStore } from './types'

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
  readonly mc: string
}

export default function mcGather(options: Options): RawAdditionalsStore {
  console.log('*️⃣ Initializing')
  const storeHelper = new PrimalRecipesHelper()

  // Init Crafting Table as first item
  storeHelper.BH('minecraft:crafting_table')

  console.log('*️⃣ append_oreDicts')
  append_oreDicts(storeHelper, loadText(join(options.mc, '/crafttweaker.log')))

  console.log('*️⃣ append_DisplayNames')
  append_DisplayNames(storeHelper, loadText(join(options.mc, '/crafttweaker_raw.log')))

  console.log('*️⃣ append_JER')
  append_JER(storeHelper, loadJson(join(options.mc, 'config/jeresources/world-gen.json')))

  console.log('*️⃣ append_JECgroups')
  append_JECgroups(storeHelper, loadText(join(options.mc, '/config/JustEnoughCalculation/data/groups.json')))

  console.log('*️⃣ append_viewBoxes')
  append_viewBoxes(storeHelper, loadJson('data/spritesheet.json'))

  /*=====  Output parsed data ======*/
  // Remove technical data
  console.log('👍 Saving ...')
  return storeHelper.exportAdditionals()
}
