export type JEC_Types = 'itemStack' | 'fluidStack' | 'oreDict' | 'placeholder' | 'empty'

export type RawCollection = { [key: string]: number }

interface RawRecipe {
  out?: RawCollection | number
  ins?: RawCollection
  ctl?: RawCollection
}

interface RawItemData {
  viewBox?: string
  display?: string

  /** Used when this object represents Oredict */
  item?: string

  /** Used when this object represents Oredict */
  meta?: number
}

interface RawAdditionals extends RawItemData {
  recipes?: RawRecipe[]
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
