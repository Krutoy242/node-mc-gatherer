export interface BaseRecipe {
  index: number
  source: string
  complexity: number
  outputs: string[]
  inputs?: string[]
  catalysts?: string[]
}
