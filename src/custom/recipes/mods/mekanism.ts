import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe('1000x fluid:heavywater', '1000x fluid:water', [
    'mekanism:machineblock:12',
    'mekanism:filterupgrade:0',
  ])

  addRecipe('entity:mekanism:robit', 'mekanism:robit:0')

  const morphs = [
    [10, 0],
    [0, 1],
    [3, 2],
    [1, 3],
    [9, 5],
    [3, 6],
    [8, 7],
    [5, 8],
  ]

  morphs.forEach(([from, to]) => {
    for (let i = 0; i < 3; i++) {
      addRecipe(`mekanism:machineblock:${5 + i}:{recipeType:${to}}`, [
        `mekanism:tierinstaller:${i}`,
        `mekanism:machineblock:${i === 0 ? from : `${4 + i}:{recipeType:${to}}`}`,
      ])
    }
  })
}
