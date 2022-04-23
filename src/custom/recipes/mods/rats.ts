export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    'rats:tiny_coin:0',
    '40x placeholder:ticks',
    'rats:rat_upgrade_aristocrat:0'
  )
  addRecipe('rats:rat_nugget:0', '730x placeholder:ticks', 'rats:raw_rat:0')
  ;(
    [
      ['rats:archeologist_hat', 10000],
      ['rats:raw_rat', 400],
      ['rats:rat_pelt', 400],
      ['rats:rat_upgrade_fragment', 7000],
      ['rats:plague_tome', 900000],
      ['rats:ratglove_flower', 100, 'dimension:ratlantis_-8'],
    ] as const
  ).forEach(([id, value, catl]) => {
    addRecipe(id + ':0', value + 'x placeholder:ticks', catl)
  })
  ;(
    [
      ['rats:piper_hat', 100],
      ['rats:plague_scythe', 9900],
      ['rats:charged_creeper_chunk', 100],
      ['rats:black_death_mask', 9000],
      ['rats:rat_toga', 100, 'dimension:ratlantis_-8'],
      ['rats:feral_rat_claw', 1000, 'dimension:ratlantis_-8'],
      ['rats:arcane_technology', 100000, 'dimension:ratlantis_-8'],
      ['rats:ancient_sawblade', 100000, 'dimension:ratlantis_-8'],
      ['rats:ratlantean_flame', 100, 'dimension:ratlantis_-8'],
      ['rats:psionic_rat_brain', 1000000, 'dimension:ratlantis_-8'],
      ['rats:pirat_hat', 500, 'dimension:ratlantis_-8'],
      ['rats:pirat_cutlass', 700, 'dimension:ratlantis_-8'],
      ['rats:marbled_cheese_rat_head', 1000, 'dimension:ratlantis_-8'],
    ] as const
  ).forEach(([id, value, catl]) => {
    addRecipe(id + ':0', value + 'x placeholder:fight', catl)
  })
}
