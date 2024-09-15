export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  const aspects = [
    'aer',
    'alienis',
    'alkimia',
    'aqua',
    'auram',
    'aversio',
    'bestia',
    'caeles',
    'cognitio',
    'desiderium',
    'draco',
    'exanimis',
    'exitium',
    'fabrico',
    'fluctus',
    'gelum',
    'herba',
    'humanus',
    'ignis',
    'imperium',
    'infernum',
    'instrumentum',
    'lux',
    'machina',
    'metallum',
    'mortuus',
    'motus',
    'mythus',
    'ordo',
    'perditio',
    'permutatio',
    'potentia',
    'praecantatio',
    'praemunio',
    'rattus',
    'sensus',
    'sonus',
    'spiritus',
    'tenebrae',
    'terra',
    'vacuos',
    'ventus',
    'victus',
    'vinculum',
    'visum',
    'vitium',
    'vitreus',
    'volatus',
  ]

  aspects.forEach((aspect) => {
    addRecipe(
      `thaumadditions:salt_essence:0:{Aspects:[{key:"${aspect}",amount:1}]}`,
      `2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"${aspect}"}]}`,
    )
  })

  addRecipe('thaumadditions:salt_essence:0:{Aspects:[{amount:9,key:"auram"}]}', '9x thaumadditions:salt_essence:0:{Aspects:[{amount:1,key:"auram"}]}')
  addRecipe('thaumadditions:void_fruit:0', '500x placeholder:ticks', 'thaumadditions:void_seed:0')

  addRecipe('entity:thaumadditions:chester', 'thaumadditions:chester:0')
  addRecipe('thaumadditions:chester:0', 'entity:thaumadditions:chester')
}
