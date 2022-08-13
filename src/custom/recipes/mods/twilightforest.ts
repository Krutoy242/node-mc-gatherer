export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('dimension:7', 'minecraft:diamond:0')
  addRecipe(
    'twilightforest:lamp_of_cinders:0',
    ['130000x placeholder:fight', '1300000x placeholder:ticks'],
    'dimension:7'
  )

  addRecipe(
    [
      '1700x twilightforest:huge_stalk:0',
      '300x twilightforest:twilight_leaves_3:1',
    ],
    ['twilightforest:magic_beans:0', 'twilightforest:uberous_soil:0']
  )
  addRecipe(
    [
      'twilightforest:magic_log_core:1',
      '60x twilightforest:magic_leaves:1',
      '20x twilightforest:magic_log:1',
    ],
    'twilightforest:twilight_sapling:6'
  )
}
