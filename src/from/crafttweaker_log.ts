import PrimalStoreHelper from '../additionalsStore'

export function append_oreDicts(storeHelper: PrimalStoreHelper, crafttweakerLogTxt: string) {
  const oreEntriesRgx = /^Ore entries for <ore:([\w]+)> :[\n\r]+-<([^:>]+:[^:>]+):?([^:>]+)?/gm
  for (const [, oreDictName, definition, meta] of crafttweakerLogTxt.matchAll(oreEntriesRgx)) {
    // Add alias (first item of OreDict)
    storeHelper.setField(oreDictName, 'item', `${definition}:${meta && meta !== '*' ? meta : 0}`)
  }
}
