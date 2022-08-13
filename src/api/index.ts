import { Ingredient } from './Ingredient'
import { Stack } from './Stack'

export * from './csv'
export * from './Tree'
export * from './Ingredient'
export * from './IngredientStore'
export * from './Stack'
export * from './Solver'
export * from './NBT'
export * from './volume'

export type IngredientStack = Stack<Ingredient<Calculable & Identified>>

/*
██████╗  █████╗ ███████╗███████╗
██╔══██╗██╔══██╗██╔════╝██╔════╝
██████╔╝███████║███████╗█████╗  
██╔══██╗██╔══██║╚════██║██╔══╝  
██████╔╝██║  ██║███████║███████╗
╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
*/

export type Base = [source: string, entry: string, meta?: string, sNbt?: string]
export interface Based {
  source: string
  entry: string
  meta?: string
  sNbt?: string
}

const baseVisibleSetup = {
  display: String,
  imgsrc: String,
}

export type BaseVisible = {
  [P in keyof typeof baseVisibleSetup]: ReturnType<typeof baseVisibleSetup[P]>
}

export const baseItemSetup = {
  ...baseVisibleSetup,
  tooltips: (s: string) => s.split('\\n'),
  purity: Number,
  complexity: Number,
  cost: Number,
  processing: Number,
  steps: Number,
  recipeIndexes: (s: string) => (s === '' ? [] : s.split(' ').map(Number)),
  id: String,
}

type BaseItemKeys = keyof typeof baseItemSetup
export type BaseItemMap = {
  [P in BaseItemKeys]: ReturnType<typeof baseItemSetup[P]>
}

export interface BaseItem extends BaseItemMap, Based {}

export interface BaseRecipe extends Calculable {
  index: number
  source: string
}

export interface CsvRecipe extends BaseRecipe {
  outputs: string[]
  inputs?: string[]
  catalysts?: string[]
}

/*
 ██████╗ █████╗ ██╗      ██████╗██╗   ██╗██╗      █████╗ ██████╗ ██╗     ███████╗
██╔════╝██╔══██╗██║     ██╔════╝██║   ██║██║     ██╔══██╗██╔══██╗██║     ██╔════╝
██║     ███████║██║     ██║     ██║   ██║██║     ███████║██████╔╝██║     █████╗  
██║     ██╔══██║██║     ██║     ██║   ██║██║     ██╔══██║██╔══██╗██║     ██╔══╝  
╚██████╗██║  ██║███████╗╚██████╗╚██████╔╝███████╗██║  ██║██████╔╝███████╗███████╗
 ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝
*/

export interface Identified {
  id: string
}

export interface Calculable {
  readonly purity: number
  readonly cost: number
  readonly processing: number
  readonly complexity: number
}
