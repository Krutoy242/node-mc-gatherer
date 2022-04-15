import { prefferedModSort } from '../lib/mods/mod_sort'
import { createFileLogger } from '../log/logger'

export interface OredictMap {
  [oreName: string]: string[]
}
const log = createFileLogger('oreDict.log')

export default function genOreDictionary(crafttweakerLogTxt: string) {
  const dict: OredictMap = {}

  const oreEntriesRgx =
    /^Ore entries for <ore:(?<oreName>[^>]+)> :\s*(?<block>(\n-<[^>]+>.*)+)/gm
  for (const match of crafttweakerLogTxt.matchAll(oreEntriesRgx)) {
    const { groups } = match
    if (!groups) throw new Error('OreDict parsing error for: ' + match[0])

    const itemCapture =
      /<(?<source>[^:>]+):(?<entry>[^:>]+):?(?<meta>[^:>]+)?>/gm

    const items = [...groups.block.matchAll(itemCapture)]
      .map((m) => m.groups as Record<string, string>)
      .sort((a, b) => prefferedModSort(a!.source, b!.source))

    if (!items[0])
      throw new Error('OreDict parsing error for block: ' + groups.block)

    dict[groups.oreName] = items.map(
      ({ source, entry, meta }) =>
        `${source}:${entry}:${meta === '*' ? 32767 : meta ?? 0}`
    )
  }

  log(
    Object.entries(dict)
      .map(([oreName, item]) => `${oreName} = ${item.join(' ')}`)
      .join('\n')
  )

  return dict
}
