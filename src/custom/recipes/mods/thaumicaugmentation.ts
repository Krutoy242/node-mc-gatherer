export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe(
    'dimension:14676',
    '100000x placeholder:exploration',
    'thaumicaugmentation:gauntlet:1'
  )
  Object.entries({
    'thaumcraft:loot_bag:0': 1000,
    'thaumcraft:loot_bag:1': 10000,
    'thaumcraft:loot_crate_common:0': 1000,
    'thaumcraft:loot_crate_rare:0': 100000,
    'thaumcraft:loot_crate_uncommon:0': 10000,
    'thaumcraft:loot_urn_common:0': 1000,
    'thaumcraft:loot_urn_rare:0': 100000,
    'thaumcraft:loot_urn_uncommon:0': 10000,
  }).forEach(([id, n]) => {
    addRecipe(id, n + 'x placeholder:exploration', 'dimension:14676')
  })
}
