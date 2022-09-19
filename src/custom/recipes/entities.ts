import type { AddRecipeFn } from '../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  // Found in world
  addRecipe('entity:minecraft:cow', '200x placeholder:exploration')

  addRecipe('minecraft:milk_bucket:0', 'minecraft:bucket:0', 'entity:minecraft:cow')
  addRecipe('1000x fluid:milk', '2x placeholder:ticks', [
    'minecraft:bucket:0',
    'entity:minecraft:cow',
  ])

  addRecipe(
    'draconicevolution:mob_soul:0:{EntityName:"excompressum:angry_chicken"}',
    '2000x placeholder:ticks'
  )

  addRecipe(
    ['minecraft:skull:5', 'minecraft:dragon_egg:0'],
    '2000000x placeholder:fight',
    'dimension:1'
  )
}
