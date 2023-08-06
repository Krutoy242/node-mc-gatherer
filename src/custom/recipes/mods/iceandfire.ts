export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('iceandfire:fire_dragon_blood:0', [
    '40000x placeholder:fight',
    'minecraft:glass_bottle:0',
  ])

  addRecipe('iceandfire:ice_dragon_blood:0', [
    '40000x placeholder:fight',
    'minecraft:glass_bottle:0',
  ])

  addRecipe('iceandfire:weezer_blue_album:0', [
    '400000x placeholder:exploration',
    'dimension:0',
  ])

  addRecipe(
    [
      'iceandfire:myrmex_desert_egg:2',
      'iceandfire:myrmex_desert_egg:0',
      'iceandfire:myrmex_desert_egg:1',
      'iceandfire:myrmex_desert_egg:3',
    ],
    '1000000x placeholder:ticks',
    'iceandfire:myrmex_desert_egg:4'
  )

  addRecipe(
    [
      'iceandfire:myrmex_jungle_egg:3',
      'iceandfire:myrmex_jungle_egg:1',
      'iceandfire:myrmex_jungle_egg:0',
      'iceandfire:myrmex_jungle_egg:2',
    ],
    '1000000x placeholder:ticks',
    'iceandfire:myrmex_jungle_egg:4'
  )

  addRecipe('entity:iceandfire:amphithere', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:cyclops', '15000x placeholder:exploration')
  addRecipe('entity:iceandfire:deathworm', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_beast', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_ghoul', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_horse', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_knight', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_lich', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_scuttler', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:dread_thrall', '1200x placeholder:exploration')
  addRecipe('entity:iceandfire:firedragon', '70000x placeholder:exploration')
  addRecipe('entity:iceandfire:gorgon', '15000x placeholder:exploration')
  addRecipe('entity:iceandfire:hippocampus', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:hippogryph', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:icedragon', '70000x placeholder:exploration')
  addRecipe('entity:iceandfire:if_cockatrice', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:if_hydra', '70000x placeholder:exploration')
  addRecipe('entity:iceandfire:if_pixie', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:if_troll', '15000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_egg', '2000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_queen', '70000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_royal', '15000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_sentinel', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_soldier', '15000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_swarmer', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:myrmex_worker', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:seaserpent', '70000x placeholder:exploration')
  addRecipe('entity:iceandfire:siren', '15000x placeholder:exploration')
  addRecipe('entity:iceandfire:snowvillager', '5000x placeholder:exploration')
  addRecipe('entity:iceandfire:stymphalianbird', '5000x placeholder:exploration')
}
