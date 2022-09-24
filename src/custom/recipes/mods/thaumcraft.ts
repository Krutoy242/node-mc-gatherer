export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('thaumcraft:salis_mundus:0', ['thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"terra"}]}', 'thaumcraft:crystal_essence:0:{Aspects:[{key:"ignis",amount:1}]}', 'thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"perditio"}]}', 'minecraft:redstone:0'], ['minecraft:flint:0', 'minecraft:bowl:0', 'minecraft:crafting_table:0'])

  addRecipe('thaumcraft:arcane_workbench:0', [
    'ore:workbench',
    'thaumcraft:salis_mundus:0',
  ])
  addRecipe('thaumcraft:crucible:0', [
    'minecraft:cauldron:0',
    'thaumcraft:salis_mundus:0',
  ])
  addRecipe('thaumcraft:infernal_furnace:0', [
    'thaumcraft:salis_mundus:0',
    '12x minecraft:nether_brick:0',
    '12x minecraft:obsidian:0',
    'minecraft:iron_bars:0',
    '1000x fluid:lava',
  ])
  addRecipe('thaumcraft:thaumonomicon:0', [
    'thaumcraft:salis_mundus:0',
    'minecraft:bookshelf:0',
  ])
  addRecipe('thaumcraft:void_seed:0', '3x thaumcraft:causality_collapser:0')
  addRecipe(
    'thaumcraft:void_seed:0',
    '60000x placeholder:ticks',
    'thaumcraft:void_siphon:0'
  )
  addRecipe('1000x fluid:flux_goo', 'thaumcraft:bottle_taint:0')

  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"aer"}]}', 'thaumcraft:crystal_aer:0')
  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"ignis"}]}', 'thaumcraft:crystal_ignis:0')
  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"aqua"}]}', 'thaumcraft:crystal_aqua:0')
  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"terra"}]}', 'thaumcraft:crystal_terra:0')
  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"ordo"}]}', 'thaumcraft:crystal_ordo:0')
  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"perditio"}]}', 'thaumcraft:crystal_perditio:0')
  addRecipe('2x thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"vitium"}]}', 'thaumcraft:crystal_vitium:0')

  addRecipe('thaumcraft:crystal_essence:*', ['thaumcraft:nugget:9'], 'thaumcraft:crucible:0')

  addRecipe([
    '10x thaumcraft:crystal_essence:*',
    '1x thaumcraft:cluster:6',
    '1x thaumcraft:cluster:5',
    '1x thaumcraft:cluster:4',
    '1x thaumcraft:cluster:3',
    '1x thaumcraft:cluster:2',
    '1x thaumcraft:cluster:1',
    '1x thaumcraft:cluster:0',
  ], '100x thaumcraft:stone_porous:0'
  )

  addRecipe('thaumcraft:stone_porous:0', ['minecraft:stone:*', '6000x placeholder:ticks'], 'thaumcraft:crucible:0')
}
