import { createFileLogger } from '../log/logger'

export interface OredictMap {
  [oreName: string]: string
}
const log = createFileLogger('oreDict.log')

const modWeights = `
  minecraft
  thermalfoundation
  immersiveengineering
  ic2
  mekanism
  appliedenergistics2
  actuallyadditions
  tconstruct
  chisel
  biomesoplenty
  nuclearcraft
  draconicevolution
  libvulpes
  astralsorcery
  rftools
  extrautils2
  forestry
  bigreactors
  enderio
  exnihilocreatio
`
  .trim()
  .split('\n')
  .map((l) => l.trim())
  .reverse()
  .reduce(
    (map, v, i) => ((map[v] = i), map),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as { [modName: string]: number }
  )

export const prefferedModSort = (a: string, b: string) => {
  const va = modWeights[b] ?? -1
  const vb = modWeights[a] ?? -1
  return va > vb ? 1 : va < vb ? -1 : 0
}

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
      .map((m) => m.groups)
      .sort((a, b) => prefferedModSort(a!.source, b!.source))

    if (!items[0])
      throw new Error('OreDict parsing error for block: ' + groups.block)

    const { source, entry, meta } = items[0]
    dict[groups.oreName] = `${source}:${entry}:${
      meta && meta !== '*' ? meta : 0
    }`
  }

  log(
    Object.entries(dict)
      .map(([oreName, item]) => `${oreName} = ${item}`)
      .join('\n')
  )

  return dict
}
