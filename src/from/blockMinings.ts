import { getCTBlock } from '../lib/utils'

export interface BlockMinings {
  [id: string]: {
    hardness: number
    toolClass: string
    level: number
  }
}

export function generateBlockMinings(
  crafttweakerLogTxt?: string
): BlockMinings | undefined {
  if (!crafttweakerLogTxt) return

  const txtBlock = getCTBlock(
    crafttweakerLogTxt,
    '#          Harvest tool and level                #',
    '##################################################'
  )
  if (!txtBlock?.length) return

  const result: BlockMinings = {}

  txtBlock.forEach((l) => {
    const groups = l.match(
      /<(?<id>[^>]+)> = (?<hardness>[^:]+):(?<toolClass>[^:]+):(?<level>.+)/
    )?.groups
    if (!groups) return

    result[groups.id] = {
      hardness: Number(groups.hardness),
      toolClass: groups.toolClass,
      level: Number(groups.level),
    }
  })
  return result
}