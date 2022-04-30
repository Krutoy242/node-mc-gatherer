import { getCTBlock } from '../lib/utils'

export function genToolDurability(
  crafttweakerLogTxt?: string
): { [id: string]: number } | undefined {
  if (!crafttweakerLogTxt) return

  const txtBlock = getCTBlock(
    crafttweakerLogTxt,
    '#                   Tools                        #',
    '##################################################'
  )
  if (!txtBlock?.length) return

  return Object.fromEntries(
    txtBlock.map((l) => [l.replace(/\d+ /, ''), Number(l.split(' ')[0])])
  )
}
