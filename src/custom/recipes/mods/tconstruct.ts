export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    '2x tconstruct:shard:0:{Material:"fusewood",display:{Name:"Fusewood Shard"}}',
    'botania:shimmerwoodplanks:0',
    'tconstruct:tooltables:2:{textureBlock:{id:"minecraft:log",Count:1b,Damage:0s}}'
  )
  addRecipe(
    '2x tconstruct:shard:0:{Material:"xu_magical_wood"}',
    'extrautils2:decorativesolidwood:1',
    'tconstruct:tooltables:2:{textureBlock:{id:"minecraft:log",Count:1b,Damage:0s}}'
  )
  addRecipe(
    'tconstruct:rack:*',
    '3x ore:slabWood',
    'minecraft:crafting_table:0'
  )
}
