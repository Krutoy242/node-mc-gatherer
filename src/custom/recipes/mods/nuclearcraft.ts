export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(
    '1000x fluid:corium',
    'nuclearcraft:cell_block:0',
    'nuclearcraft:fission_controller_new_fixed:0',
  )

  addRecipe('1000x fluid:plasma', '1000x placeholder:ticks', [
    'nuclearcraft:fusion_core:0',
    '4x nuclearcraft:fusion_connector:0',
    '100x nuclearcraft:fusion_electromagnet_idle:0',
  ])
  addRecipe('1000x fluid:corium', 'nuclearcraft:solid_fission_cell:0', 'nuclearcraft:solid_fission_controller:0')
}
