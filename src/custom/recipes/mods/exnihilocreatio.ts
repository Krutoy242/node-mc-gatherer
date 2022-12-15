export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    '2x minecraft:string:0',
    'exnihilocreatio:block_infested_leaves:0'
  )
  addRecipe(
    'exnihilocreatio:block_infested_leaves:0',
    'exnihilocreatio:block_infesting_leaves:0'
  )
  addRecipe(
    'exnihilocreatio:block_infesting_leaves:0',
    'ore:treeLeaves',
    'exnihilocreatio:item_material:2'
  )
  addRecipe(
    'exnihilocreatio:crook_tconstruct:0',
    '4x tconstruct:tool_rod:0:{Material:"wood"}',
    'tconstruct:tooltables:3'
  )
  addRecipe('ic2:sapling:0', 'exnihilocreatio:item_seed_rubber:0')
  addRecipe('minecraft:grass:0', ['exnihilocreatio:item_material:4', 'minecraft:dirt:0'])

  addRecipe('minecraft:sapling:0', 'exnihilocreatio:item_seed_oak:0')
  addRecipe('minecraft:sapling:1', 'exnihilocreatio:item_seed_spruce:0')
  addRecipe('minecraft:sapling:2', 'exnihilocreatio:item_seed_birch:0')
  addRecipe('minecraft:sapling:3', 'exnihilocreatio:item_seed_jungle:0')
  addRecipe('minecraft:sapling:4', 'exnihilocreatio:item_seed_acacia:0')
  addRecipe('minecraft:sapling:5', 'exnihilocreatio:item_seed_darkoak:0')
  addRecipe('minecraft:cactus:0', 'exnihilocreatio:item_seed_cactus:0')
  addRecipe('minecraft:reeds:0', 'exnihilocreatio:item_seed_sugarcane:0')
  addRecipe('minecraft:carrot:0', 'exnihilocreatio:item_seed_carrot:0')
  addRecipe('minecraft:potato:0', 'exnihilocreatio:item_seed_potato:0')
}
