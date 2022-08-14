const modWeights = `
minecraft
thermalfoundation
immersiveengineering
ic2
mekanism
appliedenergistics2
actuallyadditions
tconstruct
chisel
biomesoplenty
nuclearcraft
draconicevolution
libvulpes
astralsorcery
rftools
extrautils2
forestry
bigreactors
enderio
exnihilocreatio
`
  .trim()
  .split('\n')
  .map(l => l.trim())
  .reverse()
  .reduce(
    (map, v, i) => (((map[v] = i), map)),
    {} as { [modName: string]: number }
  )

export const prefferedModSort = (a: string, b: string) => {
  const va = modWeights[b] ?? -1
  const vb = modWeights[a] ?? -1
  return va > vb ? 1 : va < vb ? -1 : 0
}
