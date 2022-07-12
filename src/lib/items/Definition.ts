import 'reflect-metadata'
import _ from 'lodash'
import numeral from 'numeral'
import { Memoize } from 'typescript-memoize'

import { BaseItemSerializable, CSVLine } from '../../api/csv'
import { createFileLogger } from '../../log/logger'
import { Format, getCSVLine, Pos } from '../../tools/CsvDecorators'
import Setable from '../calc/Setable'
import Recipe from '../recipes/Recipe'
import { escapeCsv } from '../utils'

import { NBT, parseSNbt } from './NBT'

const numFormat = (n: number) => numeral(n).format('0,0.00')
const siFormat = (n: number) => numeral(n).format('a').padStart(4)

const logRecalc = createFileLogger('tmp_recalcOf.log')

export default class Definition
  extends Setable
  implements CSVLine, BaseItemSerializable
{
  /*
  ███████╗██╗███████╗██╗     ██████╗ ███████╗
  ██╔════╝██║██╔════╝██║     ██╔══██╗██╔════╝
  █████╗  ██║█████╗  ██║     ██║  ██║███████╗
  ██╔══╝  ██║██╔══╝  ██║     ██║  ██║╚════██║
  ██║     ██║███████╗███████╗██████╔╝███████║
  ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ╚══════╝
  */

  @Pos(23)
  @Format(escapeCsv)
  readonly id: string

  @Pos(21)
  viewBox?: string

  @Pos(0)
  @Format(escapeCsv)
  display?: string

  @Pos(1)
  @Format((s?: string[]) => escapeCsv(s?.join('\\n')))
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

  @Pos(22)
  get recipeIndexes() {
    return _.sortBy(
      [...(this.recipes ?? [])].map((r) => r.index),
      (i) => (i === this.mainRecipe?.index ? -10 : 0) // Main recipe first
    ).join(' ')
  }

  @Pos(20)
  get steps() {
    return this.mainRecipe?.inventory?.steps ?? ''
  }

  /*
  ███╗   ██╗███████╗██╗    ██╗
  ████╗  ██║██╔════╝██║    ██║
  ██╔██╗ ██║█████╗  ██║ █╗ ██║
  ██║╚██╗██║██╔══╝  ██║███╗██║
  ██║ ╚████║███████╗╚███╔███╔╝
  ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ 
  */
  constructor(
    id: string,
    public readonly source: string,
    public readonly entry: string,
    public readonly meta: string | undefined,
    public readonly sNbt: string | undefined
  ) {
    super()
    this.id = id
  }

  csv(): string {
    return getCSVLine(this)
  }

  override toString(options?: { complexityPad?: number; short?: boolean }) {
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
