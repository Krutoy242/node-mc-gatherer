/**
 * Predefined costs of placeholders.
 * All other item costs should be added as recipes
 */

const predefined: Record<string, number> = {
  // Common placeholders
  dim_overworld: 1.0, // Cost to get into Overworld
  ticks: 0.1, // Cost of one tick
  exploration: 1, // Cost to find 1 any block in world
  mana: 0.04,
  rf: 1,
  time: 0.02,
  bees: 10,
  seconds: 20,
  bossfight: 200,
  grid_power: 10,
  starlight: 10,
  anything: 100,

  mining: 1.0,
}
export default predefined
