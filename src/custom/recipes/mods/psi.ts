export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('psi:material:0', 'minecraft:redstone:0', 'psi:cad_assembly:0')
  addRecipe('psi:material:1', 'minecraft:gold_ingot:0', 'psi:cad_assembly:0')
  addRecipe('psi:material:2', 'minecraft:diamond:0', 'psi:cad_assembly:2')
  addRecipe('psi:material:5', 'minecraft:coal:0', 'psi:cad_assembly:2')
  addRecipe('psi:material:6', 'minecraft:quartz:0', 'psi:cad_assembly:2')
  addRecipe('psi:cad:*', 'psi:cad_assembly:*')
}
