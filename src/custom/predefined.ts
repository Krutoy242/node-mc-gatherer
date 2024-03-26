/**
 * Predefined costs of placeholders.
 * All other item costs should be added as recipes
 */

const predefined: Record<string, number> = {
  // Common placeholders
  'placeholder:ticks': 0.1, // Cost of one tick
  'placeholder:exploration': 1, // Cost to find 1 any block in world
  'placeholder:fight': 1.0,
  'placeholder:trade': 1000.0, // Villager trade
  'placeholder:rf': 1,
  'placeholder:mana': 1, // Botania Mana

  // Dimensions
  'dimension:0': 1,
  'dimension:overworld': 1,
  'dimension:Block_Drops': 1,

  // Predefined items
  'minecraft:crafting_table:0': 50,
}
export default predefined
