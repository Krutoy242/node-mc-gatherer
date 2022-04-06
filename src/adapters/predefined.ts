/**
 * Predefined costs of placeholders.
 * All other item costs should be added as recipes
 */

const predefined: Record<string, number> = {
  // Common placeholders
  'overworld (0)': 1.0,
  dim_overworld: 1.0, // Cost to get into Overworld
  ticks: 0.1, // Cost of one tick
  exploration: 1, // Cost to find 1 any block in world
  mana: 0.04,
  rf: 1,
}
export default predefined
