import type { IType } from "./NameMap"

export interface JEIECategory {
  width: number
  height: number
  texture: string
  catalysts: JEIEItem[]
  recipes: JEIERecipe[]
}

export interface JEIERecipe {
  input: List
  output: List
}

export interface JEIECustomRecipe extends JEIERecipe {
  catalyst?: JEIEIngredient[]
}

export interface List {
  items: JEIESlot[]
}

export interface JEIESlot extends JEIEIngredient {
  x: number
  y: number
}

export interface JEIEIngredient {
  amount: number
  stacks: JEIEItem[]
}

export interface JEIEItem {
  type: IType
  name: string
}
