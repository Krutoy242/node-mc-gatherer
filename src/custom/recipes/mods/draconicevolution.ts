import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'draconicevolution:chaos_shard:0',
    '10000000x placeholder:fight',
    'dimension:1',
  )
}
