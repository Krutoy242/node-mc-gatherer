import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe('entity:industrialforegoing:pink_slime', '2000x fluid:if.pink_slime')
}
