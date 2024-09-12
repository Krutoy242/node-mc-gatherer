export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(
    'dimension:-11325',
    'placeholder:ticks',
    'extrautils2:teleporter:1',
  )
  addRecipe('extrautils2:decorativesolid:8', 'extrautils2:decorativesolid:3', [
    'extrautils2:resonator:0',
    'extrautils2:rainbowgenerator:0',
  ])
  addRecipe(
    'extrautils2:decorativesolidwood:1',
    ['ore:bookshelf', 'minecraft:gold_ingot:0'],
    'minecraft:crafting_table:0',
  )
  addRecipe(
    'extrautils2:ironwood_leaves:1',
    'extrautils2:ironwood_leaves:0',
    'minecraft:flint_and_steel:0',
  )
  addRecipe(
    'extrautils2:ironwood_log:1',
    'extrautils2:ironwood_log:0',
    'minecraft:flint_and_steel:0',
  )
  addRecipe('extrautils2:suncrystal:0', [
    'extrautils2:suncrystal:250',
    '800x placeholder:ticks',
  ])
  addRecipe(
    [
      '6x extrautils2:ironwood_log:0',
      'extrautils2:ironwood_sapling:0',
      '12x extrautils2:ironwood_leaves:0',
    ],
    '3x minecraft:dye:15',
    'extrautils2:ironwood_sapling:0',
  )
  addRecipe('extrautils2:snowglobe:1', ['extrautils2:snowglobe:0', '10000x placeholder:exploration'])
}
