import PrimalStoreHelper from '../lib/PrimalStoreHelper'

type CrlogRawType = {
  [mod: string]: [
    display: string,
    definition: string,
    snbt: string,
    burntime: number
  ][]
}

export function append_DisplayNames(
  storeHelper: PrimalStoreHelper,
  crLog: string
) {
  let modMap: CrlogRawType = {}
  try {
    modMap = JSON.parse(crLog).all_items
  } catch (e: any) {
    console.log('something wrong with parseCrafttweakerLog_raw: ')
    console.log(e.message)
    return
  }

  Object.values(modMap)
    .flat()
    .forEach(([display, definition, snbt]) => {
      const [mod, id, meta] = definition.split(':')
      const fullId = `${mod}:${id}:${meta || '0'}`
      const hasNBT = snbt && snbt !== '{}'
      if (hasNBT) storeHelper.setField(fullId + snbt, 'display', display)
      storeHelper.setField(fullId, 'display', display)

      if (fullId === 'openblocks:tank:0' && hasNBT) {
        addFluid(storeHelper, display, snbt)
      }
    })
}

function addFluid(
  storeHelper: PrimalStoreHelper,
  display: string,
  snbt: string
) {
  // If its openblocks:tank, we can also get fluid name
  // Just lazy to deal with fluid logs
  const fluidName = snbt.match(/FluidName:"(.+)"/)?.[1]
  const fluidDisplay = display.match(/(.+) Tank/)?.[1]
  storeHelper.setField(`fluid:${fluidName}`, 'display', fluidDisplay)
}
