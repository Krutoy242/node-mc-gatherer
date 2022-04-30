import { BlockMinings } from '../from/blockMinings'

const appropriateTools: { [toolClass: string]: string } = {
  pickaxe: 'tconstruct:pick_head:0',
  axe: 'tconstruct:axe_head:0',
  shears: 'tconstruct:kama_head:0',
  shovel: 'tconstruct:shovel_head:0',
}

const materialsByLevel = [
  'flint',
  'copper',
  'certus_quartz',
  'iron',
  'lead',
  'osmium',
  'obsidian',
  'cobalt',
  'manyullyn',
  'osgloglas',
  'enderium',
  'terrasteel',
  'ma.supremium',
  'draconic_metal',
  'chaotic_metal',
  'infinity_metal',
]

function getTconTool(toolClass: string, level: number): string | undefined {
  if (toolClass === 'jackhammer') return 'advancedrocketry:jackhammer:0'
  if (level === 0 && toolClass !== 'pickaxe') return

  const tool = appropriateTools[toolClass]
  if (!tool) return

  const mat =
    materialsByLevel[level] ?? materialsByLevel[materialsByLevel.length - 1]

  return tool + `:{Material:"${mat}"}`
}

export default function getTool(
  blockMinings: BlockMinings | undefined,
  blockId: string
): string | undefined {
  if (!blockMinings) return

  const bMining = blockMinings[blockId]
  if (!bMining) return

  return getTconTool(bMining.toolClass, bMining.level)
}
