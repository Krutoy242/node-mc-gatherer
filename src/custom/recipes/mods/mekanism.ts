import { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe('1000x fluid:heavywater', '1000x fluid:water', [
    'mekanism:machineblock:12',
    'mekanism:filterupgrade:0',
  ])
}
