/**
 * Predefined costs of placeholders.
 * All other item costs should be added as recipes
 */

const predefined: Record<string, number> = {
  // Common placeholders
  ticks: 0.1, // Cost of one tick
  exploration: 1, // Cost to find 1 any block in world
  fight: 1.0,
  rf: 1,
}
export default predefined
