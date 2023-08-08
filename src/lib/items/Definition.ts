import 'reflect-metadata'
import _ from 'lodash'
import numeral from 'numeral'

import type { BaseVisible, Based, LabelSetup, Labeled, Solvable } from '../../api'

import { Csv } from '../../tools/CsvDecorators'
import type Recipe from '../recipes/Recipe'
import { escapeCsv } from '../utils'
import Labelable from '../calc/Labelable'

const numFormat = (n: number) => numeral(n).format('0,0.00')
const siFormat = (n: number) => numeral(n).format('a').padStart(4)

// const logRecalc = createFileLogger('tmp_recalcOf.log')

export default class Definition
  extends Labelable
  implements Based, BaseVisible, Labeled, Solvable<Definition> {
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

  @Csv(21.5)
  override labels = ''

  @Csv(0, escapeCsv)
  display?: string

  @Csv(1, (s?: string[]) => escapeCsv(s?.join('\\n')))
  tooltips?: string[]

  /**
   * Recipes that has this item as output
   */
  recipes: Set<Recipe> | undefined

  mainRecipe: Recipe | undefined

  mainRecipeAmount: number | undefined

  dependencies: Set<Recipe> | undefined

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
    super()
    this.id = id
  }

  override toString(options?: { complexityPad?: number; short?: boolean }) {
    const display = `"${this.display}" ${this.id}`
    if (options?.short) return display
    const full
      = `${getPurity(this.purity)
      + this.complexity_s.padStart(options?.complexityPad ?? 0)
      } 🧮${siFormat(this.cost)}`
      + ` ⚙️${siFormat(this.processing)}`
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
    if (this.mainRecipe !== rec && this.mainRecipe?.calculate()) this.calculate()

    if (this.complexity <= rec.complexity) return false

    this.setRecipe(rec, amount)
    return true
  }

  calculate() {
    const main = this.mainRecipe
    if (!main) return

    const newCost = main.cost / (this.mainRecipeAmount ?? 1)
    if (this.processing === main.processing && this.cost === newCost) return

    this.set({
      purity    : main.purity,
      cost      : newCost,
      processing: main.processing,
    })
    return true
  }

  protected isLabeled(label: keyof typeof LabelSetup) {
    return {
      Bottleneck: () => [...this.recipes ?? []].filter(r => r.purity > 0).length === 1,
      Alone     : () => this.purity > 0 && [...this.dependencies ?? []].filter(r => r.purity > 0).length === 1,
    }[label]()
  }

  public get complexity_s(): string {
    return numFormat(this.complexity)
  }

  private setRecipe(rec: Recipe, amount: number) {
    this.mainRecipe = rec
    this.mainRecipeAmount = amount
    this.calculate()
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
