import { AddRecipeFn } from '../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe('minecraft:water_bucket:0', [
    'minecraft:bucket:0',
    '1000x fluid:water',
  ])
}
