import PrimalStoreHelper from '../additionalsStore'

export function append_oreDicts(storeHelper: PrimalStoreHelper, crafttweakerLogTxt: string) {
  const oreEntriesRgx = /^Ore entries for <ore:([\w]+)> :[\n\r]+-<([^:>]+:[^:>]+):?([^:>]+)?/gm
  for (const match of crafttweakerLogTxt.matchAll(oreEntriesRgx)) {
    const [, oreDictName, definition, meta] = match

    // Add alias (first item of OreDict)
    const adds = storeHelper.setField(oreDictName, 'item', definition)
    if (meta && meta !== '*') adds.meta = parseInt(meta)
  }
}
