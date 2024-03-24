export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('rftoolsdim:dimlet_energy_module:*', 'rftoolsdim:dimlet_parcel:0')
  addRecipe('rftoolsdim:dimlet_parcel:*', '1000x placeholder:fight')

  addRecipe('dimension:RFTools_Dimension', '1000x placeholder:exploration', [
    'rftoolsdim:dimension_enscriber:0 | rftdimtweak:dimension_enscriber:0',
    'rftoolsdim:dimension_builder:0 | rftdimtweak:dimension_builder:0',
    'rftoolsdim:dimension_editor:0 | rftdimtweak:dimension_editor:0',
  ])

  addRecipe(
    'rftoolsdim:dimensional_blank_block:*',
    '1000x placeholder:exploration',
    'dimension:RFTools_Dimension',
  )
}
