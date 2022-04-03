export type JEC_Types =
  | 'itemStack'
  | 'fluidStack'
  | 'oreDict'
  | 'placeholder'
  | 'empty'

export type RawCollection = { [key: string]: number }

interface RawRecipe {
  out?: RawCollection | number
  ins?: RawCollection
  ctl?: RawCollection
}

interface RawAdditionals {
  viewBox?: string
  display?: string
  recipes?: RawRecipe[]
  used: number
}

export type RawAdditionalsStore = {
  [key: string]: RawAdditionals
}

export interface IndexedRawAdditionals extends RawAdditionals {
  index: number
}

export type IndexedRawAdditionalsStore = {
  [key: string]: IndexedRawAdditionals
}
