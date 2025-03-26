export function genToolDurability(): { [id: string]: number } {
  return {
    'animania:carving_knife': 1000,
    'appliedenergistics2:certus_quartz_cutting_knife': 50,
    'appliedenergistics2:nether_quartz_cutting_knife': 50,
    'ic2:forge_hammer': 80,
    'ic2:cutter': 60,
    'ic2:treetap': 16,
    'matc:inferiumcrystal': 256,
    'matc:intermediumcrystal': 1024,
    'matc:prudentiumcrystal': 512,
    'matc:superiumcrystal': 2048,
    'matc:supremiumcrystal': 4096,
    'immersiveengineering:tool': 100,
    'ore:craftingToolForgeHammer': 80, // TODO: There shouldnt be oredict
    'thaumcraft:primordial_pearl': 8,
  }
}
