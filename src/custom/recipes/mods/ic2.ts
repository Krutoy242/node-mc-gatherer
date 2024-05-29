export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
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
    'ic2:sapling:0',
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
    ],
  )

  addRecipe('fluid:ic2pahoehoe_lava', 'fluid:lava', ['ic2:te:31', 'ic2:crafting:7'])
  addRecipe('fluid:ic2coolant', 'fluid:ic2hot_coolant', ['ic2:te:31', 'ic2:crafting:7'])
  addRecipe('fluid:ic2coolant', 'fluid:ic2hot_coolant', ['ic2:te:31', 'ic2:crafting:7'])
  addRecipe('ic2:advanced_re_battery:0:{charge:100000.0d}', ['ic2:advanced_re_battery:*', '400000x placeholder:rf'])
  addRecipe('ic2:energy_crystal:0:{charge:1000000.0d}', ['ic2:energy_crystal:*', '4000000x placeholder:rf'])
  addRecipe('ic2:lapotron_crystal:0:{charge:1.0E7d}', ['ic2:lapotron_crystal:*', '40000000x placeholder:rf'])
  addRecipe('ic2:re_battery:0:{charge:10000.0d}', ['ic2:re_battery:*', '40000x placeholder:rf'])

  const seedTiers = {
    weed: 0,
    beetroots: 1,
    pumpkin: 1,
    wheat: 1,
    blackthorn: 2,
    brown_mushroom: 2,
    carrots: 2,
    cyazint: 2,
    dandelion: 2,
    flax: 2,
    melon: 2,
    potato: 2,
    red_mushroom: 2,
    reed: 2,
    rose: 2,
    tulip: 2,
    cocoa: 3,
    venomilia: 3,
    stickreed: 4,
    corpse_plant: 5,
    hops: 5,
    nether_wart: 5,
    terra_wart: 5,
    aurelia: 6,
    blazereed: 6,
    corium: 6,
    stagnium: 6,
    cyprium: 6,
    eatingplant: 6,
    egg_plant: 6,
    ferru: 6,
    milk_wart: 6,
    plumbiscus: 6,
    redwheat: 6,
    shining: 6,
    slime_plant: 6,
    spidernip: 7,
    coffee: 7,
    creeper_weed: 7,
    meat_rose: 7,
    tearstalks: 8,
    withereed: 8,
    oil_berries: 9,
    ender_blossom: 10,
    bobs_yer_uncle_ranks_berries: 11,
    diareed: 12,
  }

  Object.entries(seedTiers).forEach(([name, tier]) =>
    addRecipe(`ic2:crop_seed_bag:0:{owner:"ic2",scan:1b,growth:1b,id:"${name}",resistance:1b,gain:1b}`, `${(tier + 1) ** 3 * 100}x placeholder:ticks`))

  addRecipe(['250x fluid:ic2creosote', 'minecraft:coal:1'], 'ore:logWood', ['23x ic2:refractory_bricks:0', 'ic2:te:100', 'ic2:te:101', 'ic2:te:102'])
  addRecipe(['1000x fluid:ic2weed_ex', 'ic2:fluid_cell:0'], 'ic2:fluid_cell:0:{Fluid:{FluidName:"ic2weed_ex",Amount:1000}}')
  addRecipe('ic2:nuclear:11', 'ic2:uranium_fuel_rod:0:{advDmg:0}', 'ic2:te:22')
}
