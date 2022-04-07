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

export type ITypes =
  | 'item'
  | 'oredict'
  | 'fluid'
  | 'requious.compat.jei.ingredient.Energy'
  | 'crazypants.enderio.base.integration.jei.energy.EnergyIngredient'
  | 'thaumcraft.api.aspects.AspectList'

export type NameMap = Record<ITypes, Visible>
export type Visible = Record<string, NameData>
export interface NameData {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}
