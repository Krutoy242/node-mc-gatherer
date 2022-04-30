export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('ic2:crop_res:5', '200x placeholder:ticks', 'ic2:weeding_trowel:0')

  addRecipe('17x ic2:misc_resource:4', '1700x placeholder:ticks', [
    'ic2:rubber_wood:0',
    'ic2:treetap:0',
  ])
  addRecipe('fluid:ic2uu_matter', '880000x placeholder:rf', 'ic2:te:61')
  addRecipe('ic2:misc_resource:1', '100x fluid:ic2uu_matter', 'ic2:te:63')
  addRecipe(
    ['7x ic2:rubber_wood:0', '20x ic2:leaves:0'],
    '200x placeholder:ticks',
    'ic2:sapling:0'
  )
  addRecipe(
    '10000x fluid:ic2hot_coolant',
    ['10000x fluid:ic2coolant', 'ic2:nuclear:0'],
    [
      '95x ic2:resource:14',
      'ic2:te:25',
      'ic2:te:26',
      'ic2:te:23',
      '6x ic2:te:24',
      'ic2:te:22',
    ]
  )
}
