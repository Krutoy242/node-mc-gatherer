export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('200x hotair:prodigytech:hotair', '5x ore:charcoal', 'prodigytech:solid_fuel_aeroheater:0')
  addRecipe('250x hotair:prodigytech:hotair', 'prodigytech:energion_dust:0', 'prodigytech:energion_aeroheater:0')
  addRecipe('1000x hotair:prodigytech:hotair', ['5x ore:charcoal', 'prodigytech:tartaric_stoker:0'], 'prodigytech:tartaric_aeroheater:0')
}
