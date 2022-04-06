import RecipeStore from '../../lib/RecipeStore'

function dimToID(name: string) {
  return 'placeholder:dim_' + name.toLowerCase()
}

export default function addRecipes(
  getAddRecipe: RecipeStore['forCategory'],
  stack: RecipeStore['BH']
) {
  const addRecipe = getAddRecipe('dimensions')

  addRecipe(
    dimToID('Nether'),
    'minecraft:flint_and_steel:0',
    stack('minecraft:obsidian:0', 8)
  )
  addRecipe(dimToID('The End'), stack('minecraft:ender_eye:0', 12))
  addRecipe(dimToID('Twilight Forest'), 'minecraft:diamond:0')
  addRecipe(
    dimToID('Deep Dark'),
    'placeholder:exploration',
    'extrautils2:teleporter:1'
  )
  addRecipe(dimToID('Ratlantis'), 'rats:chunky_cheese_token:0')
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
      addRecipe(dimToID(dim), stack('fluid:rocketfuel', 10000), catl)
    )
  )
}
