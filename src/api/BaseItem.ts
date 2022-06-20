export const baseItemSetup = {
  display: {
    type: '' as string | undefined,
  },
  tooltips: {
    type: Array<string>() as Array<string> | undefined,
    parse: (s: string) => s.split('\\n'),
  },
  purity: {
    type: 0,
    parse: Number,
  },
  complexity: {
    type: 0,
    parse: Number,
  },
  cost: {
    type: 0,
    parse: Number,
  },
  processing: {
    type: 0,
    parse: Number,
  },
  steps: {
    type: 0,
    parse: Number,
  },
  viewBox: {
    type: '' as string | undefined,
  },
  recipeIndexes: {
    type: Array<number>(),
    parse: (s: string) => s.split(' ').map(Number),
  },
  id: {
    type: '',
  },
} as const

export type BaseItemKeys = keyof typeof baseItemSetup
export type BaseItemMap = {
  [P in BaseItemKeys]: typeof baseItemSetup[P]['type']
}

export interface BaseItem extends BaseItemMap {
  // Additional parsed fields
  source: string
  entry: string
  meta: number
  sNbt?: string
}
