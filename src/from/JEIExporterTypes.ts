export interface JEIExporterCategory {
  width: number
  height: number
  texture: string
  catalysts: Ingredient[]
  recipes: Recipe[]
}

export interface Recipe {
  input: List
  output: List
}

export interface List {
  items: Slot[]
}

export interface Slot {
  amount: number
  x: number
  y: number
  stacks: Ingredient[]
}

export interface Ingredient {
  type: ITypes
  name: string
}

export type ITypes =
  | 'item'
  | 'oredict'
  | 'fluid'
  | 'requious.compat.jei.ingredient.Energy'
  | 'crazypants.enderio.base.integration.jei.energy.EnergyIngredient'
  | 'thaumcraft.api.aspects.AspectList'

export type NameMap = Record<ITypes, Visible>
export type Visible = Record<string, NameData>
export type NameData = {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}
