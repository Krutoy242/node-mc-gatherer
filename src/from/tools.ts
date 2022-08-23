// import { getCTBlock } from '../lib/utils'

// export function genToolDurability(
//   crafttweakerLogTxt?: string
// ): { [id: string]: number } | undefined {
//   if (!crafttweakerLogTxt) return

//   const txtBlock = getCTBlock(
//     crafttweakerLogTxt,
//     '#                   Tools                        #',
//     '##################################################'
//   )
//   if (!txtBlock?.length) return

//   return Object.fromEntries(
//     txtBlock.map((l) => [l.replace(/\d+ /, ''), Number(l.split(' ')[0])])
//   )
// }

export function genToolDurability(
  _crafttweakerLogTxt?: string
): { [id: string]: number } | undefined {
  return {
    'animania:carving_knife'                         : 1000,
    'appliedenergistics2:certus_quartz_cutting_knife': 50,
    'appliedenergistics2:nether_quartz_cutting_knife': 50,
    'ic2:forge_hammer'                               : 80,
    'ic2:cutter'                                     : 60,
    'ic2:treetap'                                    : 16,
    'matc:inferiumcrystal'                           : 256,
    'matc:intermediumcrystal'                        : 1024,
    'matc:prudentiumcrystal'                         : 512,
    'matc:superiumcrystal'                           : 2048,
    'matc:supremiumcrystal'                          : 4096,
    'immersiveengineering:tool'                      : 100,
  }
}
