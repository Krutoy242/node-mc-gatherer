export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(
    'cyclicmagic:fire_dark:0',
    '10x placeholder:ticks',
    'cyclicmagic:ender_blaze:0:{}',
  )
  addRecipe(
    'cyclicmagic:fire_dark:0',
    '10x placeholder:ticks',
    'cyclicmagic:fire_starter:0',
  )
  addRecipe(
    'cyclicmagic:fire_frost:0',
    '10x placeholder:ticks',
    'cyclicmagic:fire_starter:0',
  )

  addRecipe(['cyclicmagic:fire_frost:0', 'cyclicmagic:fire_dark:0'], '20x placeholder:ticks', 'cyclicmagic:fire_starter:0')
}
