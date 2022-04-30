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
}
