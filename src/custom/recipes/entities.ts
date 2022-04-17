import { AddRecipeFn } from '../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  // Found in world
  addRecipe('entity:cow', '200x placeholder:exploration')

  addRecipe('minecraft:milk_bucket:0', 'minecraft:bucket:0', 'entity:cow')
  addRecipe('1000x fluid:milk', '2x placeholder:ticks', [
    'minecraft:bucket:0',
    'entity:cow',
  ])

  addRecipe(
    'draconicevolution:mob_soul:0:{EntityName:"excompressum:angry_chicken"}',
    '2000x placeholder:ticks'
  )
}
