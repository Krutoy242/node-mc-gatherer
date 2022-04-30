export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('astralsorcery:blockcelestialcrystals:4', [
    'astralsorcery:itemrockcrystalsimple:*:*',
    'astralsorcery:itemcraftingcomponent:2',
    '1000x fluid:astralsorcery.liquidstarlight',
  ])
  addRecipe(
    'astralsorcery:itemcelestialcrystal:*:*',
    'astralsorcery:blockcelestialcrystals:4'
  )
}
