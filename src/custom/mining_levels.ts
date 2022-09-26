import type { BlockMinings } from '../from/blockMinings'

export default function getMiningPlaceholder(
  blockMinings: BlockMinings | undefined,
  blockId: string
): string | undefined {
  if (!blockMinings) return

  const bMining = blockMinings[blockId]
  if (!bMining || bMining.hardness < 0) return

  const toolClass = bMining.toolClass === 'null' ? 'pickaxe' : bMining.toolClass
  return `placeholder:${toolClass}:${Math.max(0, bMining.level)}`
}
