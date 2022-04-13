export const iTypesMap: Record<string, IType> = {
  _GenericMultiblockIngredient:
    'mctmods.immersivetechnology.common.util.compat.jei.GenericMultiblockIngredient',
  _hybridFluid:
    'hellfirepvp.modularmachinery.common.integration.ingredient.HybridFluid',
  aspect: 'thaumcraft.api.aspects.AspectList',
  energy: 'crazypants.enderio.base.integration.jei.energy.EnergyIngredient',
  fluid: 'fluid',
  gas: 'mekanism.api.gas.GasStack',
  item: 'item',
  liquid: 'fluid',
  ore: 'oredict',
  placeholder: 'placeholder',
  rf: 'requious.compat.jei.ingredient.Energy',
}

export const iTypePrefix = {
  placeholder: 'placeholder',
  oredict: 'ore',
  item: '',
  fluid: 'fluid',
  'thaumcraft.api.aspects.AspectList': 'aspect',
  'requious.compat.jei.ingredient.Energy': 'rf',
  'mekanism.api.gas.GasStack': '',
  'mctmods.immersivetechnology.common.util.compat.jei.GenericMultiblockIngredient':
    'multiblock',
  'hellfirepvp.modularmachinery.common.integration.ingredient.HybridFluid': '',
  'crazypants.enderio.base.integration.jei.energy.EnergyIngredient': 'rf',
} as const

export type IType = keyof typeof iTypePrefix
