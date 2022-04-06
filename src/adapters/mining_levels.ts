const appropriateTools: { [toolClass: string]: string } = {
  pickaxe: 'tconstruct:pick_head:0',
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
  const tool = appropriateTools[toolClass]
  if (!tool) return

  const mat =
    materialsByLevel[level] ?? materialsByLevel[materialsByLevel.length - 1]

  return tool + `:{Material:"${mat}"}`
}
