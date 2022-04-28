import { AddRecipeFn } from '../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe('dimension:overworld_0', 'placeholder:exploration')

  addRecipe(
    'dimension:nether_-1',
    '0.015x minecraft:flint_and_steel:0',
    '8x minecraft:obsidian:0'
  )
  addRecipe('dimension:the_end_1', '12x minecraft:ender_eye:0')
  addRecipe('dimension:twilight_forest_7', 'minecraft:diamond:0')
  addRecipe(
    'dimension:deep_dark_-11325',
    'placeholder:exploration',
    'extrautils2:teleporter:1'
  )
  addRecipe(
    'dimension:spectre_-343800852',
    '10x placeholder:exploration',
    'randomthings:spectrekey'
  )
  addRecipe('dimension:ratlantis_-8', 'rats:chunky_cheese_token:0')
  addRecipe('dimension:rftools_dimension', '1000x placeholder:exploration', [
    'rftdimtweak:dimension_enscriber',
    'rftoolsdim:dimension_builder',
    'rftoolsdim:dimension_editor',
  ])
  ;(
    [
      ['advancedrocketry:rocketbuilder:0', ['luna_100']],
      [
        'advancedrocketry:stationbuilder:0',
        [
          'europa_106',
          'io_105',
          'mars_103',
          'mercury_101',
          'neptune_110',
          'titan_108',
          'uranus_109',
          'venus_102',
        ],
      ],
      [
        'advancedrocketry:warpmonitor:0',
        [
          'kelt-2ab_118',
          'kelt-3_119',
          'kelt-4ab_120',
          'kelt-6a_121',
          'kepler_0118_122',
          'kepler_0119_123',
          'novus_113',
          'proxima_b_111',
          'stella_114',
          'terra_nova_112',
        ],
      ],
      ['thaumicaugmentation:gauntlet:1', ['emptiness_14676']],
    ] as [string, string[]][]
  ).forEach(([catl, arr]) =>
    arr.forEach((dim) =>
      addRecipe('dimension:' + dim, '10000x fluid:rocketfuel', catl)
    )
  )

  addRecipe('1000x fluid:water', 'placeholder:exploration')

  // Recipes in dimensions
  addRecipe(
    'minecraft:dragon_breath:0',
    'minecraft:glass_bottle:0',
    'dimension:the_end_1'
  )
}
