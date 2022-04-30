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
}
