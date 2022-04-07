export interface JEIExporterCategory {
  width: number
  height: number
  texture: string
  catalysts: Item[]
  recipes: JEIERecipe[]
}

export interface JEIERecipe {
  input: List
  output: List
}

export interface JEIECustomRecipe extends JEIERecipe {
  catalyst?: Ingredient[]
}

export interface List {
  items: Slot[]
}

export interface Slot extends Ingredient {
  x: number
  y: number
}

export interface Ingredient {
  amount: number
  stacks: Item[]
}

export interface Item {
  type: ITypes
  name: string
}

export const iTypesMap = {
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
} as const

export const iTypeAddPrefix: Record<ITypes, string> = {
  'crazypants.enderio.base.integration.jei.energy.EnergyIngredient': 'fe',
  'mekanism.api.gas.GasStack': 'gas',
  'requious.compat.jei.ingredient.Energy': 'fe',
  'thaumcraft.api.aspects.AspectList': 'aspect',
  'hellfirepvp.modularmachinery.common.integration.ingredient.HybridFluid':
    'fluid',
  'mctmods.immersivetechnology.common.util.compat.jei.GenericMultiblockIngredient':
    'multiblock',
  fluid: 'fluid',
  item: '',
  oredict: 'ore',
  placeholder: 'placeholder',
}

export type ITypes = typeof iTypesMap[keyof typeof iTypesMap]

export type NameMap = Record<ITypes, Visible>
export type Visible = Record<string, NameData>
export interface NameData {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}
