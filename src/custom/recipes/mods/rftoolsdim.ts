export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('rftoolsdim:dimlet_energy_module:*', 'rftoolsdim:dimlet_parcel:0')
}
