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
    list.forEach(([imgsrc, sNbt]) => {
      applyVB(id, imgsrc)
      if (sNbt) applyVB(`${id}:${sNbt}`, imgsrc)
    })
  })

  function applyVB(id: string, imgsrc: string) {
    const def = storeHelper.lookById(id)
    if (!def) return
    def.imgsrc ??= imgsrc
  }
}
