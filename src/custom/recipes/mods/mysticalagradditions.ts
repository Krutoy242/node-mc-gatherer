export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    'mysticalagradditions:dragon_egg_essence:0',
    '1000x placeholder:ticks',
    [
      'mysticalagradditions:dragon_egg_seeds:0',
      'minecraft:farmland:0',
      'mysticalagradditions:special:1',
    ]
  )
  addRecipe('0.35x mysticalagradditions:stuff:1', '100000x placeholder:fight')
}
