import { IType } from './IType'

export interface JEIECategory {
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
  type: IType
  name: string
}
