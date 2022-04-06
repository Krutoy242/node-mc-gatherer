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

export default function getTool(
  toolClass: string,
  level: number
): string | undefined {
  if (toolClass === 'jackhammer') return 'advancedrocketry:jackhammer:0'
  if (toolClass === 'shovel' && level === 0) return

  const tool = appropriateTools[toolClass]
  if (!tool) return

  const mat =
    materialsByLevel[level] ?? materialsByLevel[materialsByLevel.length - 1]

  return tool + `:{Material:"${mat}"}`
}
