export const baseItemSetup = {
  display: String,
  tooltips: (s: string) => s.split('\\n'),
  purity: Number,
  complexity: Number,
  cost: Number,
  processing: Number,
  steps: Number,
  viewBox: String,
  recipeIndexes: (s: string) => s.split(' ').map(Number),
  id: String,
}

type BaseItemKeys = keyof typeof baseItemSetup
export type BaseItemMap = {
  [P in BaseItemKeys]: ReturnType<typeof baseItemSetup[P]>
}

export interface BaseItem extends BaseItemMap {
  // Additional parsed fields
  source: string
  entry: string
  meta: number
  sNbt?: string
}
