const appropriateTools: { [toolClass: string]: string } = {
  pickaxe: 'tconstruct:pick_head',
  axe    : 'tconstruct:axe_head',
  shears : 'tconstruct:kama_head',
  shovel : 'tconstruct:shovel_head',
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

export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  Object.entries(appropriateTools).forEach(([toolClass, toolId]) => {
    materialsByLevel.forEach((material, level) => {
      addRecipe(`placeholder:${toolClass}:${level}`, `${toolId}:0:{Material:"${material}"}`)
    })
  })
}

// Object.entries(appropriateTools).forEach(([toolClass, toolId]) => {
//   materialsByLevel.forEach((material, level) => {
//     console.log(`,{"input":[{"type":"itemStack", "content":{"amount":1L, "item":"${toolId}","nbt": {"Material": "${material}"} } }], "output":[{"type":"placeholder", "content":{"amount":1L, "name":"${toolClass}:${level}" } }] }`)
//   })
// })

