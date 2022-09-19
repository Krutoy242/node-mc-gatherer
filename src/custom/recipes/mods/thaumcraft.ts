export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('thaumcraft:salis_mundus:0', ['thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"terra"}]}', 'thaumcraft:crystal_essence:0:{Aspects:[{key:"ignis",amount:1}]}', 'thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"perditio"}]}', 'minecraft:redstone:0'], ['minecraft:flint:0', 'minecraft:bowl:0', 'minecraft:crafting_table:0'])

  addRecipe('thaumcraft:arcane_workbench:0', [
    'minecraft:crafting_table:0',
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
}
