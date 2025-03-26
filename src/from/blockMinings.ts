import { getCTBlock } from '../lib/utils'

export interface BlockMinings {
  [id: string]: {
    hardness: number
    toolClass: string
    level: number
  }
}

const predefinedBlockMinings: BlockMinings = {
  'minecraft:vine:0': { hardness: 0, toolClass: 'shears', level: 0 },
  'minecraft:tallgrass:0': { hardness: 0, toolClass: 'shears', level: 0 },
  'minecraft:leaves:0': { hardness: 0, toolClass: 'shears', level: 0 },
}

export function generateBlockMinings(
  crafttweakerLogTxt?: string,
): BlockMinings | undefined {
  if (!crafttweakerLogTxt)
    return

  const txtBlock = getCTBlock(
    crafttweakerLogTxt,
    '#          Harvest tool and level                #',
    '##################################################',
  )
  if (!txtBlock?.length)
    return

  const result: BlockMinings = { ...predefinedBlockMinings }

  txtBlock.forEach((l) => {
    const groups = l.match(
      /<(?<id>[^>]+)> = (?<hardness>[^:]+):(?<toolClass>[^:]+):(?<level>.+)/,
    )?.groups
    if (!groups)
      return

    result[groups.id] = {
      hardness: Number(groups.hardness),
      toolClass: groups.toolClass,
      level: Number(groups.level),
    }
  })
  return result
}
