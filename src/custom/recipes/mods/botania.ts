export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    [
      'botania:biomestonea:8',
      'botania:biomestonea:9',
      'botania:biomestonea:10',
      'botania:biomestonea:11',
      'botania:biomestonea:12',
      'botania:biomestonea:13',
      'botania:biomestonea:14',
      'botania:biomestonea:15',
    ],
    '7x minecraft:cobblestone:0',
    'botania:specialflower:0:{type:"marimorphosis"}'
  )

  addRecipe('5x botania:flower:*', 'botania:fertilizer:0', '5x minecraft:grass:0')
  addRecipe('botania:doubleflower2:*', 'botania:petal:*', 'minecraft:dye:15')
  addRecipe('botania:doubleflower1:*', 'botania:petal:*', 'minecraft:dye:15')
}
