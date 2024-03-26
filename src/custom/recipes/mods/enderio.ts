export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('enderio:item_soul_vial:1:*', [
    'enderio:item_soul_vial:0',
    '10000x placeholder:ticks',
  ])
  addRecipe('enderio:item_material:20', '100x placeholder:ticks', 'minecraft:flint_and_steel:0')

  ;[
    'iceandfire:icedragon',
    'minecraft:blaze',
    'minecraft:chicken',
    'minecraft:cow',
    'minecraft:creeper',
    'minecraft:elder_guardian',
    'minecraft:enderman',
    'minecraft:ghast',
    'minecraft:guardian',
    'minecraft:husk',
    'minecraft:pig',
    'minecraft:rabbit',
    'minecraft:sheep',
    'minecraft:shulker',
    'minecraft:skeleton',
    'minecraft:slime',
    'minecraft:spider',
    'minecraft:stray',
    'minecraft:witch',
    'minecraft:wither_skeleton',
    'minecraft:zombie',
    'rats:black_death',
    'tconstruct:blueslime',
    'thermalfoundation:blizz',
    'twilightforest:kobold',
    'twilightforest:minotaur',
    'twilightforest:penguin',
    'twilightforest:swarm_spider',
  ].forEach(id => addRecipe(`enderio:item_broken_spawner:0:{entityId:"${id}"}`, [
    'minecraft:mob_spawner:0',
    'actuallyadditions:item_spawner_changer:0',
    `entity:${id}`,
  ]))
}
