import PrimalStoreHelper from '../additionalsStore'

/**
 * Write viewboxes into additionals from spritesheet.json
 * @param spritesheetRaw Parsed JSON obj
 */
export function append_viewBoxes(storeHelper: PrimalStoreHelper, spritesheetRaw: { [itemID: string]: string[][] }) {
  Object.entries(spritesheetRaw).forEach(([def, list]) => {
    list.forEach(([viewBox, sNbt]) => {
      storeHelper.setField(def, 'viewBox', viewBox)
      if (sNbt) storeHelper.setField(def + sNbt, 'viewBox', viewBox)
    })
  })
}
