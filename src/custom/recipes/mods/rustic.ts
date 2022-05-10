import { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'rustic:fluid_bottle:0:{Fluid:{FluidName:"wine",Amount:1000,Tag:{Quality:1.0f}}}',
    '1000x fluid:grapejuice',
    'rustic:brewing_barrel:0'
  )
  addRecipe('rustic:grapes:0', '40x placeholder:ticks', 'rustic:grape_stem:0')
  addRecipe(
    'rustic:wildberries:0',
    '100x placeholder:ticks',
    'rustic:wildberry_bush:0'
  )
  addRecipe('rustic:sapling_apple:0', 'rustic:apple_seeds:0')
  addRecipe(
    [
      '15x rustic:leaves_apple:0',
      '8x minecraft:log:0',
      '2x rustic:sapling_apple:0',
    ],
    '4x minecraft:dye:15',
    'rustic:sapling_apple:0'
  )
  addRecipe('minecraft:apple:0', '2x minecraft:dye:15', 'rustic:leaves_apple:0')
}
