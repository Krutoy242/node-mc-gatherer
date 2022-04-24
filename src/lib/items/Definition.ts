import numeral from 'numeral'

import Calculable from '../calc/Calculable'
import Recipe from '../recipes/Recipe'

const numFormat = (n: number) => numeral(n).format('0,0.00')

export default class Definition implements Calculable {
  static csvHeader =
    'Display,Purity,Complexity,Cost,Processing,Steps,ViewBox,Recs,MainRec,Recipes,ID'

  static actualMeta(meta?: string): string | undefined {
    return meta === undefined
      ? undefined
      : // eslint-disable-next-line eqeqeq
      meta == '32767'
      ? '*'
      : meta
  }

  static baseToId(
    source: string,
    entry: string,
    meta?: string,
    sNbt?: string
  ): string {
    const m = Definition.actualMeta(meta)
    return `${source}:${entry}${m !== undefined ? ':' + m : ''}${
      sNbt ? ':' + sNbt : ''
    }`
  }

  readonly id: string

  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0

  viewBox?: string
  display?: string

  /**
   * Recipes that has this item as output
   */
  recipes?: Set<Recipe>

  mainRecipe?: Recipe

  /**
   * Recipes that depends on this item
   */
  dependencies?: Set<number>

  constructor(
    public readonly source: string,
    public readonly entry: string,
    public readonly meta?: string,
    public readonly sNbt?: string
  ) {
    this.id = Definition.baseToId(source, entry, meta, sNbt)
  }

  csv(): string {
    const recipes = [...(this.recipes ?? [])]
    return [
      escapeCsv(this.display),
      this.purity,
      this.complexity,
      this.cost,
      this.processing,
      this.mainRecipe?.inventory?.steps ?? '',
      this.viewBox,
      recipes.length,
      this.mainRecipe?.index ?? '',
      recipes.map((r) => r.index).join(' '),
      escapeCsv(this.id),
    ].join(',')
  }

  toString() {
    return `${getPurity(this.purity)}${complexity(this.complexity)} "${
      this.display
    }" ${this.id}`
  }
}

function complexity(n: number) {
  return numFormat(n).padStart(20)
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}

function escapeCsv(s?: string): string {
  return s?.replace(/,/g, '،') ?? ''
}
