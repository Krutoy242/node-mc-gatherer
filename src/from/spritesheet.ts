import DefinitionStore from '../lib/items/DefinitionStore'

/**
 * Write viewboxes into additionals from spritesheet.json
 * @param spritesheetRaw Parsed JSON obj
 */
export default function append_viewBoxes(
  storeHelper: DefinitionStore,
  spritesheetRaw: { [itemID: string]: string[][] }
) {
  Object.entries(spritesheetRaw).forEach(([id, list]) => {
    list.forEach(([viewBox, sNbt]) => {
      applyVB(id, viewBox)
      if (sNbt) applyVB(`${id}:${sNbt}`, viewBox)
    })
  })

  function applyVB(id: string, viewBox: string) {
    const def = storeHelper.lookById(id)
    if (!def) return
    def.viewBox ??= viewBox
  }
}
