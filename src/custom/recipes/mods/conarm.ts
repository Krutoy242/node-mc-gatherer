export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('conarm:armorforge:*', 'conarm:armorforge:*')

  ;[
    ['conarm:boots:*', 'conarm:boots_core:0'],
    ['conarm:chestplate:*', 'conarm:chest_core:0'],
    ['conarm:helmet:*', 'conarm:helmet_core:0'],
    ['conarm:leggings:*', 'conarm:leggings_core:0'],
  ].forEach(([out, inp]) => {
    addRecipe(out, ['conarm:armor_trim:0:{Material:"wood"}', 'conarm:armor_plate:0:{Material:"wood"}', `${inp}:{Material:"wood"}`], 'conarm:armorstation:0')
  })
}
