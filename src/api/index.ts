import type { Ingredient } from './Ingredient'
import type { Stack } from './Stack'

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
  imgsrc : String,
} as const

const calculableSetup = {
  purity    : Number,
  cost      : Number,
  processing: Number,
  complexity: Number,
} as const

const stringArr = (splitter: string) => (s: string) => (s === '' ? [] : s.split(splitter))
const numberArr = (splitter: string) => (s: string) => stringArr(splitter)(s).map(Number)

export const baseItemSetup = {
  ...baseVisibleSetup,
  ...calculableSetup,
  id           : String,
  labels       : String,
  steps        : Number,
  tooltips     : stringArr('\\n'),
  recipeIndexes: numberArr(' '),
  depIndexes   : numberArr(' '),
} as const

export type BaseVisible = {
  [P in keyof typeof baseVisibleSetup]?: ReturnType<typeof baseVisibleSetup[P]>
}

export type BaseItemMap = {
  [P in keyof typeof baseItemSetup]: ReturnType<typeof baseItemSetup[P]>
}

export interface BaseItem extends BaseItemMap, Based {}

/*
██╗      █████╗ ██████╗ ███████╗██╗     ███████╗
██║     ██╔══██╗██╔══██╗██╔════╝██║     ██╔════╝
██║     ███████║██████╔╝█████╗  ██║     ███████╗
██║     ██╔══██║██╔══██╗██╔══╝  ██║     ╚════██║
███████╗██║  ██║██████╔╝███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝
*/

export interface Labeled {
  labels: string
}

export const Label = {
  Bottleneck: '🍾', // Item that have only one recipe
} as const

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

export type Calculable = {
  readonly [P in keyof typeof calculableSetup]: ReturnType<typeof calculableSetup[P]>
}

/*
██████╗ ███████╗ ██████╗██╗██████╗ ███████╗███████╗
██╔══██╗██╔════╝██╔════╝██║██╔══██╗██╔════╝██╔════╝
██████╔╝█████╗  ██║     ██║██████╔╝█████╗  ███████╗
██╔══██╗██╔══╝  ██║     ██║██╔═══╝ ██╔══╝  ╚════██║
██║  ██║███████╗╚██████╗██║██║     ███████╗███████║
╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝     ╚══════╝╚══════╝
*/

export interface BaseRecipe extends Calculable {
  index: number
  source: string
  labels?: string
}

export interface CsvRecipe extends BaseRecipe {
  outputs: string[]
  inputs?: string[]
  catalysts?: string[]
}

export interface SolvableRecipe<T extends Identified> extends Calculable {
  outputs: Stack<Ingredient<T>>[]
  catalysts?: Stack<Ingredient<T>>[]
  inputs?: Stack<Ingredient<T>>[]
  requirments: Stack<Ingredient<T>>[]

  outputsDef?: Stack<T>[]
  catalystsDef?: Stack<T>[]
  inputsDef?: Stack<T>[]
}

export interface Solvable<T extends Identified> extends Identified, Calculable {
  recipes: Set<SolvableRecipe<T>> | undefined
  mainRecipe: SolvableRecipe<T> | undefined
  mainRecipeAmount: number | undefined

  /**
   * Recipes that depends on this item
   */
  dependencies: Set<SolvableRecipe<T>> | undefined
}
