export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe(
    '1000x fluid:lifeessence',
    '1000x placeholder:ticks',
    'bloodmagic:altar:0',
  )

  addRecipe(
    'bloodmagic:blood_shard:0',
    '130x placeholder:fight',
    'bloodmagic:bound_sword:0',
  )

  addRecipe('bloodmagic:monster_soul:0', 'bloodmagic:soul_snare:0')
  addRecipe(
    'bloodmagic:slate:0',
    ['botania:livingrock:0', '1000x fluid:lifeessence'],
    'bloodmagic:altar:0',
  )
  addRecipe(
    'bloodmagic:slate:1',
    ['bloodmagic:slate:0', '2000x fluid:lifeessence'],
    'bloodmagic:altar:0',
  )
  addRecipe(
    'bloodmagic:slate:2',
    ['bloodmagic:slate:1', '5000x fluid:lifeessence'],
    'bloodmagic:altar:0',
  )
  addRecipe(
    'bloodmagic:slate:3',
    ['bloodmagic:slate:2', '15000x fluid:lifeessence'],
    'bloodmagic:altar:0',
  )
  addRecipe(
    'bloodmagic:slate:4',
    ['bloodmagic:slate:3', '30000x fluid:lifeessence'],
    'bloodmagic:altar:0',
  )

  addRecipe('bloodmagic:item_demon_crystal:*', '40000x placeholder:ticks', [
    'bloodmagic:ritual_controller:0',
    '20x bloodmagic:ritual_stone:0',
  ])

  addRecipe(
    '10x bloodmagic:monster_soul:0',
    '100x placeholder:fight',
    'bloodmagic:sentient_sword:0',
  )
  addRecipe(
    '1000x fluid:blockfluidantimatter',
    '1000x fluid:lifeessence',
    'cyclicmagic:ender_lightning:0',
  )
}
