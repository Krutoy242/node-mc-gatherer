import numeral from 'numeral'
import { Memoize } from 'typescript-memoize'

import Calculable from '../calc/Calculable'
import Recipe from '../recipes/Recipe'

import { NBT, parseSNbt } from './NBT'

const numFormat = (n: number) => numeral(n).format('0,0.00')

export default class Definition implements Calculable {
  static csvHeader =
    'Display,Tooltips,Purity,Complexity,Cost,Processing,Steps,ViewBox,Recs,MainRec,Recipes,ID'

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
  tooltips?: string[]

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
      this.tooltips?.map(escapeCsv).join('\\n'),
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

  @Memoize(JSON.stringify)
  toString(options?: {
    complexityPad?: number
    noPurity?: boolean
    noComplexity?: boolean
  }) {
    return `${options?.noPurity ? '' : getPurity(this.purity)}${
      options?.noComplexity
        ? ''
        : this.complexity_s.padStart(options?.complexityPad ?? 0)
    } "${this.display}" ${this.id}`
  }

  @Memoize()
  public get nbt(): NBT | undefined {
    return parseSNbt(this.sNbt)
  }

  @Memoize()
  public get complexity_s(): string {
    return numFormat(this.complexity)
  }
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}

function escapeCsv(s?: string): string {
  return s?.replace(/,/g, '،') ?? ''
}
