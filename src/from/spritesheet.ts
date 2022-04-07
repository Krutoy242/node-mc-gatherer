import DefinitionStore from '../lib/DefinitionStore'

/**
 * Write viewboxes into additionals from spritesheet.json
 * @param spritesheetRaw Parsed JSON obj
 */
export default function append_viewBoxes(
  storeHelper: DefinitionStore,
  spritesheetRaw: { [itemID: string]: string[][] }
) {
  Object.entries(spritesheetRaw).forEach(([def, list]) => {
    list.forEach(([viewBox, sNbt]) => {
      storeHelper.getAuto(def).viewBox ??= viewBox
      if (sNbt) storeHelper.getAuto(`${def}:${sNbt}`).viewBox ??= viewBox
    })
  })
}
