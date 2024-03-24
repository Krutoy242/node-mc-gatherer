export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('astralsorcery:blockcelestialcrystals:4', [
    'astralsorcery:itemrockcrystalsimple:*',
    'astralsorcery:itemcraftingcomponent:2',
    '1000x fluid:astralsorcery.liquidstarlight',
  ])
  addRecipe(
    'astralsorcery:itemcelestialcrystal:*',
    'astralsorcery:blockcelestialcrystals:4',
  )
  addRecipe(
    'astralsorcery:itemcrystalsword:0:{astralsorcery:{size:1800,purity:100,collect:100,fract:0,sizeOverride:-1}}',
    'astralsorcery:itemcrystalsword:*',
  )

  addRecipe(
    'astralsorcery:itemtunedcelestialcrystal:*',
    ['astralsorcery:itemcelestialcrystal:*', '1000x placeholder:ticks'],
    [
      'astralsorcery:blockattunementaltar:0',
      '4x astralsorcery:blockattunementrelay:0',
      '225x astralsorcery:blockblackmarble:0',
      '12x astralsorcery:blockmarble:2',
      '80x astralsorcery:blockmarble:3',
      '4x astralsorcery:blockmarble:4',
      '4x astralsorcery:blockmarble:6',
    ],
  )

  addRecipe(
    'astralsorcery:itemtunedrockcrystal:*',
    ['astralsorcery:itemrockcrystalsimple:*', '1000x placeholder:ticks'],
    [
      'astralsorcery:blockattunementaltar:0',
      '4x astralsorcery:blockattunementrelay:0',
      '225x astralsorcery:blockblackmarble:0',
      '12x astralsorcery:blockmarble:2',
      '80x astralsorcery:blockmarble:3',
      '4x astralsorcery:blockmarble:4',
      '4x astralsorcery:blockmarble:6',
    ],
  )
}
