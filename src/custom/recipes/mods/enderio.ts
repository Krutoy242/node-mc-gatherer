export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('enderio:item_soul_vial:1:*', [
    'enderio:item_soul_vial:0',
    '10000x placeholder:ticks',
  ])
  addRecipe('enderio:item_material:20', '100x placeholder:ticks', 'minecraft:flint_and_steel:0')
}
