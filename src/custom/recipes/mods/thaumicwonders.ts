export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  const eldrichMultiblock = [
    'thaumicwonders:alienist_stone:*',
    'minecraft:iron_bars:0',
    '12x thaumcraft:stone_arcane:0',
    '12x minecraft:obsidian:0',
    'fluid:fluid_quicksilver',
  ]

  addRecipe('thaumicwonders:eldritch_cluster:8', 'thaumcraft:void_seed:0', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:6', 'thaumcraft:cluster:6', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:5', 'thaumcraft:cluster:5', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:4', 'thaumcraft:cluster:4', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:3', 'thaumcraft:cluster:3', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:2', 'thaumcraft:cluster:2', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:1', 'thaumcraft:cluster:1', eldrichMultiblock)
  addRecipe('thaumicwonders:eldritch_cluster:0', 'thaumcraft:cluster:0', eldrichMultiblock)
}
