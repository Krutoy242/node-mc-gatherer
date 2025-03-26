export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('entity:rats:rat', '1000x placeholder:ticks', 'rats:garbage_pile:0')
  addRecipe('entity:rats:ratlantean_spirit', '10x placeholder:exploration', 'dimension:-8')
  addRecipe('entity:rats:marbled_cheese_golem', ['rats:marbled_cheese_golem_core:0', '3x rats:marbled_cheese_raw:0', 'rats:marbled_cheese_rat_head:0'])
  addRecipe('entity:rats:illager_piper', '1000x placeholder:exploration')
  addRecipe('entity:rats:pirat', '1000x placeholder:exploration', 'dimension:-8')
  addRecipe('entity:rats:pirat_boat', '1000x placeholder:exploration', 'dimension:-8')
  addRecipe('entity:rats:feral_ratlantean', '1000x placeholder:exploration', 'dimension:-8')
  addRecipe('rats:contaminated_food:0', 'minecraft:apple:0', 'entity:rats:rat')
  addRecipe('8x rats:tiny_coin:0', ['rats:rat_upgrade_aristocrat:0', '1000x placeholder:ticks'])
  addRecipe('dimension:-8', 'rats:chunky_cheese_token:0')
  addRecipe(
    'rats:tiny_coin:0',
    '40x placeholder:ticks',
    'rats:rat_upgrade_aristocrat:0',
  )
  addRecipe('rats:rat_nugget:0', '730x placeholder:ticks', 'entity:rats:rat')
  addRecipe('rats:charged_creeper_chunk:0', 'entity:minecraft:creeper', '200x placeholder:fight')
  ;(
    [
      ['rats:archeologist_hat', 10000],
      ['rats:rat_upgrade_fragment', 7000],
      ['rats:plague_tome', 900000],
      ['rats:ratglove_flower', 100, 'dimension:-8'],
    ] as const
  ).forEach(([id, value, catl]) => {
    addRecipe(`${id}:0`, `${value}x placeholder:ticks`, catl)
  })
  ;(
    [
      ['rats:piper_hat', 100],
      ['rats:plague_scythe', 9900],
      ['rats:black_death_mask', 9000],
      ['rats:rat_toga', 100, 'dimension:-8'],
      ['rats:feral_rat_claw', 1000, 'dimension:-8'],
      ['rats:arcane_technology', 100000, 'dimension:-8'],
      ['rats:ancient_sawblade', 100000, 'dimension:-8'],
      ['rats:ratlantean_flame', 100, 'dimension:-8'],
      ['rats:psionic_rat_brain', 1000000, 'dimension:-8'],
      ['rats:pirat_hat', 500, 'dimension:-8'],
      ['rats:pirat_cutlass', 700, 'dimension:-8'],
      ['rats:marbled_cheese_rat_head', 1000, 'dimension:-8'],
    ] as const
  ).forEach(([id, value, catl]) => {
    addRecipe(`${id}:0`, `${value}x placeholder:fight`, catl)
  })
}
