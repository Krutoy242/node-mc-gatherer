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
    'entity:excompressum:angry_chicken',
    ['entity:minecraft:chicken', 'minecraft:stick:0'],
  )

  addRecipe(
    ['minecraft:skull:5', 'minecraft:dragon_egg:0'],
    '2000000x placeholder:fight',
    'dimension:1',
  )

  addRecipe('entity:minecraft:bat', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:blaze', '1000x placeholder:exploration', 'dimension:-1')
  addRecipe('entity:minecraft:cave_spider', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:creeper', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:elder_guardian', '10000x placeholder:exploration')
  addRecipe('entity:minecraft:ender_dragon', '100000x placeholder:exploration', 'dimension:1')
  addRecipe('entity:minecraft:enderman', '10000x placeholder:exploration')
  addRecipe('entity:minecraft:endermite', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:evocation_illager', '100000x placeholder:exploration')
  addRecipe('entity:minecraft:guardian', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:husk', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:illusion_illager', '100000x placeholder:exploration')
  addRecipe('entity:minecraft:mule', '1000x placeholder:ticks', ['entity:minecraft:horse', 'entity:minecraft:donkey'])
  addRecipe('entity:minecraft:shulker', '1000x placeholder:exploration', 'dimension:1')
  addRecipe('entity:minecraft:silverfish', '1000x placeholder:exploration', 'dimension:-1')
  addRecipe('entity:minecraft:skeleton', '100x placeholder:exploration')
  addRecipe('entity:minecraft:skeleton_horse', '10000x placeholder:exploration')
  addRecipe('entity:minecraft:snowman', ['2x minecraft:snow:0', 'minecraft:pumpkin:0'])
  addRecipe('entity:minecraft:spider', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:stray', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:vex', '100000x placeholder:exploration')
  addRecipe('entity:minecraft:villager', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:villager_golem', ['4x minecraft:iron_block:0', 'minecraft:pumpkin:0'])
  addRecipe('entity:minecraft:vindication_illager', '100000x placeholder:exploration')
  addRecipe('entity:minecraft:witch', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:wither', ['5000x placeholder:fight', '4x minecraft:soul_sand:0', '3x minecraft:skull:1'])
  addRecipe('entity:minecraft:wither_skeleton', '1000x placeholder:exploration', 'dimension:-1')
  addRecipe('entity:minecraft:zombie', '100x placeholder:exploration')
  addRecipe('entity:minecraft:zombie_horse', '10000x placeholder:exploration')
  addRecipe('entity:minecraft:zombie_villager', '1000x placeholder:exploration')

  addRecipe('entity:minecraft:ghast', '1000x placeholder:exploration', 'dimension:-1')
  addRecipe('entity:minecraft:magma_cube', '1000x placeholder:exploration', 'dimension:-1')

  addRecipe('entity:minecraft:chicken', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:cow', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:donkey', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:horse', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:llama', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:ocelot', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:parrot', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:pig', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:polar_bear', '10000x placeholder:exploration')
  addRecipe('entity:minecraft:rabbit', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:sheep', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:slime', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:squid', '1000x placeholder:exploration')
  addRecipe('entity:minecraft:wolf', '1000x placeholder:exploration')

  addRecipe('entity:minecraft:mooshroom', '100000x placeholder:exploration')
}
