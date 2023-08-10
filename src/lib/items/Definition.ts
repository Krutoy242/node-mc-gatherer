import 'reflect-metadata'
import _ from 'lodash'
import numeral from 'numeral'

import type { BaseVisible, Based, Calculable, Labeled, Solvable } from '../../api'
import { LabelSetup } from '../../api'

import { Csv } from '../../tools/CsvDecorators'
import type Recipe from '../recipes/Recipe'
import { escapeCsv } from '../utils'
import Setable from '../calc/Setable'

const numFormat = (n: number) => numeral(n).format('0,0.00')
const siFormat = (n: number) => numeral(n).format('a').padStart(4)

// const logRecalc = createFileLogger('tmp_recalcOf.log')

export default class Definition
implements Based, BaseVisible, Calculable, Labeled, Solvable<Definition> {
  /*
  ███████╗██╗███████╗██╗     ██████╗ ███████╗
  ██╔════╝██║██╔════╝██║     ██╔══██╗██╔════╝
  █████╗  ██║█████╗  ██║     ██║  ██║███████╗
  ██╔══╝  ██║██╔══╝  ██║     ██║  ██║╚════██║
  ██║     ██║███████╗███████╗██████╔╝███████║
  ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ╚══════╝
  */

  @Csv(23, escapeCsv)
  readonly id: string

  @Csv(21)
  imgsrc?: string

  @Csv(0, escapeCsv)
  display?: string

  @Csv(1, (s?: string[]) => escapeCsv(s?.join('\\n')))
  tooltips?: string[]

  naturalCost?: number

  @Csv(12) get cost() {
    if (this.naturalCost) return this.naturalCost
    return (this.mainRecipe?.cost ?? Number.POSITIVE_INFINITY) / (this.mainRecipeAmount ?? 1.0)
  }

  @Csv(13) get processing() {
    return this.naturalCost ? 0.0 : this.mainRecipe?.processing ?? Number.POSITIVE_INFINITY
  }

  @Csv(10) get purity() {
    return this.naturalCost ? 1.0 : this.mainRecipe?.purity ?? 0.0
  }

  @Csv(11) get complexity() {
    return this.cost + this.processing
  }

  /**
   * Recipes that has this item as output
   */
  recipes: Set<Recipe> | undefined

  mainRecipe: Recipe | undefined

  mainRecipeAmount: number | undefined

  dependencies: Set<Recipe> | undefined

  @Csv(21.5)
  get labels() {
    const isLabeled: Record<keyof typeof LabelSetup, () => boolean> = {
      Bottleneck: () => [...this.recipes ?? []].filter(r => r.purity > 0).length === 1,
      Alone     : () => this.purity > 0 && [...this.dependencies ?? []].filter(r => r.purity > 0).length === 1,
    }

    // Compute and apply all labels
    type LabKey = keyof typeof LabelSetup
    const entries = Object.entries(LabelSetup) as [LabKey, typeof LabelSetup[LabKey]][]
    return entries
      .map(([label, { char }]) => isLabeled[label]() ? char : '')
      .join('')
  }

  @Csv(22)
  get recipeIndexes() {
    return _.sortBy(
      [...(this.recipes ?? [])].map(r => r.index),
      i => (i === this.mainRecipe?.index ? -1 : 0) // Main recipe always first
    ).join(' ')
  }

  /** Indexes of recipes that depends on this item */
  @Csv(22.5)
  get depIndexes(): string {
    return [...(this.dependencies ?? [])].map(r => r.index).join(' ')
  }

  @Csv(20)
  get steps() {
    return this.mainRecipe?.inventory?.steps
      ? this.mainRecipe.inventory.steps + 1
      : ''
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
    this.id = id
  }

  toString(options?: { complexityPad?: number; short?: boolean }) {
    const display = `"${this.display}" ${this.id}`
    if (options?.short) return display
    const full
      = `${getPurity(this.purity)
      + this.complexity_s.padStart(options?.complexityPad ?? 0)
      } 🧮${siFormat(this.cost)}`
      + ` ⚙️${siFormat(this.processing)}`
    return `${full} ${display}`
  }

  get complexity_s(): string {
    return numFormat(this.complexity)
  }

  /**
   * Suggest recipe to be chosen as main
   * @returns `true` if calculable values was changed
   */
  suggest(rec: Recipe, amount: number): boolean {
    if (this.purity > rec.purity) return false
    if (this.purity < rec.purity) return this.setRecipe(rec, amount)
    if (this.complexity <= rec.complexity) return false
    return this.setRecipe(rec, amount)
  }

  private setRecipe(rec: Recipe, amount: number) {
    this.mainRecipe = rec
    this.mainRecipeAmount = amount
    return true
  }

  /*
  difference(other?: Inventory) {
    const result = { added: [] as Recipe[], removed: [] as Recipe[] }
    if (!other) return result

    this.stepsRecipes.forEach((rec) => {
      if (!other.stepsRecipes.has(rec)) result.removed.push(rec)
    })
    other.stepsRecipes.forEach((rec) => {
      if (!this.stepsRecipes.has(rec)) result.added.push(rec)
    })
    return result
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
        const list = diff?.[key].map(r =>
          r.toString({ detailed: true }).split('\n').join('\n      ')
        )
        logRecalc(`${symbol}\n    ${list.join('\n    ')}\n`)
      })
    }
    logRecalc(`${this.toString()}\n`)
    logRecalc(`${rec?.toString({ detailed: true })}\n`)
  }
  */
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}
