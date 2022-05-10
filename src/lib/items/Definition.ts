import numeral from 'numeral'
import { Memoize } from 'typescript-memoize'

import { createFileLogger } from '../../log/logger'
import Calculable from '../calc/Calculable'
import Recipe from '../recipes/Recipe'
import { escapeCsv } from '../utils'

import { NBT, parseSNbt } from './NBT'

const numFormat = (n: number) => numeral(n).format('0,0.00')
const siFormat = (n: number) => numeral(n).format('a').padStart(4)

const logRecalc = createFileLogger('tmp_recalcOf.log')

export default class Definition extends Calculable {
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

  viewBox?: string
  display?: string
  tooltips?: string[]

  /**
   * Recipes that has this item as output
   */
  recipes?: Set<Recipe>

  mainRecipe?: Recipe
  mainRecipeAmount?: number

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
    super()
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

  toString(options?: { complexityPad?: number; short?: boolean }) {
    const display = `"${this.display}" ${this.id}`
    if (options?.short) return display
    const full =
      getPurity(this.purity) +
      this.complexity_s.padStart(options?.complexityPad ?? 0) +
      ` 🧮${siFormat(this.cost)}` +
      ` ⚙️${siFormat(this.processing)}`
    return `${full} ${display}`
  }

  /**
   * Suggest recipe to be chosen as main
   * @returns `true` if calculable values was changed
   */
  suggest(rec: Recipe, amount: number): boolean {
    if (this.purity > rec.purity) return false

    // Just set recipe values, because they are purest
    if (this.purity < rec.purity) {
      this.setRecipe(rec, amount)
      return true
    }

    // Recalculate old recipe
    if (this.mainRecipe !== rec) {
      if (this.mainRecipe?.calculate()) this.calculate()
    }

    if (this.complexity <= rec.complexity) return false

    this.setRecipe(rec, amount)
    return true
  }

  calculate(): boolean {
    const main = this.mainRecipe
    if (!main) return false

    const newCost = main.cost / (this.mainRecipeAmount ?? 1)
    if (this.processing === main.processing && this.cost === newCost)
      return false

    this.set({
      purity: main.purity,
      cost: newCost,
      processing: main.processing,
    })
    return true
  }

  @Memoize()
  public get nbt(): NBT | undefined {
    return parseSNbt(this.sNbt)
  }

  public get complexity_s(): string {
    return numFormat(this.complexity)
  }

  private setRecipe(rec: Recipe, amount: number) {
    if (this.id === 'mekanism:energycube:0:{tier:4}') {
      this.logRecalculation(rec)
    }

    this.mainRecipe = rec
    this.mainRecipeAmount = amount
    this.calculate()
  }

  private logRecalculation(rec: Recipe) {
    if (this.mainRecipe) {
      const diff = this.mainRecipe.inventory?.difference(rec?.inventory)
      const filds = [
        ['➖', 'removed'],
        ['➕', 'added'],
      ] as const
      filds.forEach(([symbol, key]) => {
        if (!diff?.[key].length) return
        const list = diff?.[key].map((r) =>
          r.toString({ detailed: true }).split('\n').join('\n      ')
        )
        logRecalc(`${symbol}\n    ${list.join('\n    ')}\n`)
      })
    }
    logRecalc(this.toString() + '\n')
    logRecalc(rec?.toString({ detailed: true }) + '\n')
  }
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}
