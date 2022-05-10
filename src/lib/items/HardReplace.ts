const hardReplaceMap: Record<string, string> = {
  'ic2:energy_crystal:26': 'ic2:energy_crystal:0',
  'ic2:energy_crystal:27': 'ic2:energy_crystal:0',
  'ic2:lapotron_crystal:26': 'ic2:energy_crystal:0',
  'ic2:lapotron_crystal:27': 'ic2:energy_crystal:0',
  'ic2:mining_laser:26': 'ic2:mining_laser:*',
  'astralsorcery:itemrockcrystalsimple:0:{astralsorcery:{crystalProperties:{size:400,purity:100,collectiveCapability:100,fract:0,sizeOverride:-1}}}':
    'astralsorcery:itemrockcrystalsimple:0',
  'astralsorcery:itemrockcrystalsimple:0:{astralsorcery:{}}':
    'astralsorcery:itemrockcrystalsimple:0',
  'thaumcraft:nitor_purple:0': 'thaumcraft:nitor_yellow:0',
  'botania:pool:0:{RenderFull:1b}': 'botania:pool:0',
  'forestry:chipsets:0:{T:0s}': 'forestry:chipsets:0',
  'forestry:chipsets:1:{T:1s}': 'forestry:chipsets:1',
  'forestry:chipsets:2:{T:2s}': 'forestry:chipsets:2',
  'forestry:chipsets:3:{T:3s}': 'forestry:chipsets:3',
}

export default hardReplaceMap
