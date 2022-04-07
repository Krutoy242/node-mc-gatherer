function dimToID(name: string) {
  return 'placeholder:dim_' + name.toLowerCase()
}

export default function addRecipes(
  addRecipe: (
    recipe_source: string,
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => void
) {
  const addDimRecipe = (
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => addRecipe('custom_dimensions', outputs, inputs, catalysts)

  addDimRecipe(
    dimToID('Nether'),
    'minecraft:flint_and_steel:0',
    '8x minecraft:obsidian:0'
  )
  addDimRecipe(dimToID('The End'), '12x minecraft:ender_eye:0')
  addDimRecipe(dimToID('Twilight Forest'), 'minecraft:diamond:0')
  addDimRecipe(
    dimToID('Deep Dark'),
    'placeholder:exploration',
    'extrautils2:teleporter:1'
  )
  addDimRecipe(dimToID('Ratlantis'), 'rats:chunky_cheese_token:0')
  ;(
    [
      ['advancedrocketry:rocketbuilder:0', ['Luna']],
      [
        'advancedrocketry:stationbuilder:0',
        [
          'Mercury',
          'Venus',
          'Mars',
          'Io',
          'Europa',
          'Titan',
          'Uranus',
          'Neptune',
        ],
      ],
      [
        'advancedrocketry:warpmonitor:0',
        [
          'Proxima B',
          'Terra Nova',
          'Novus',
          'Stella',
          'KELT-2ab',
          'KELT-3',
          'KELT-4ab',
          'KELT-6a',
          'Kepler 0118',
          'Kepler 0119',
        ],
      ],
      ['thaumicaugmentation:gauntlet:1', ['Emptiness']],
    ] as [string, string[]][]
  ).forEach(([catl, arr]) =>
    arr.forEach((dim) =>
      addDimRecipe(dimToID(dim), '10000x fluid:rocketfuel', catl)
    )
  )

  addRecipe('custom_worldgen', '1000x fluid:water', 'placeholder:exploration')
}
