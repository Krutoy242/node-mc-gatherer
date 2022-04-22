export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('betteranimalsplus:pheasantraw:0', '630x placeholder:ticks')
  addRecipe('betteranimalsplus:turkey_leg_raw:0', '630x placeholder:ticks')
  addRecipe('betteranimalsplus:pheasant_egg:0', '430x placeholder:ticks')
  addRecipe('betteranimalsplus:turkey_egg:0', '430x placeholder:ticks')
  addRecipe('betteranimalsplus:goose_egg:0', '430x placeholder:ticks')

  addRecipe('betteranimalsplus:goatmilk:0', [
    'minecraft:bucket:0',
    '130x placeholder:ticks',
  ])
}
