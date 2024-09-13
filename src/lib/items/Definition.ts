import 'reflect-metadata'
import _ from 'lodash'
import numeral from 'numeral'

import type { BaseVisible, Based, Calculable, IngrAmount, Labeled } from '../../api'
import { LabelSetup } from '../../api'

import { Csv } from '../../tools/CsvDecorators'
import type Recipe from '../recipes/Recipe'
import { escapeCsv } from '../utils'
import { Solvable } from '../../api/Solvable'

const infin = (n: number) => n === Number.POSITIVE_INFINITY ? 'Infinity' : undefined
const numFormat = (n: number) => infin(n) ?? numeral(n).format('0,0.00')
const siFormat = (n: number) => infin(n) ?? numeral(n).format('a').padStart(4)

// const logRecalc = createFileLogger('tmp_recalcOf.log')

export default class Definition extends Solvable
  implements Based, BaseVisible, Calculable, Labeled {
  /*
  ███████╗██╗███████╗██╗     ██████╗ ███████╗
  ██╔════╝██║██╔════╝██║     ██╔══██╗██╔════╝
  █████╗  ██║█████╗  ██║     ██║  ██║███████╗
  ██╔══╝  ██║██╔══╝  ██║     ██║  ██║╚════██║
  ██║     ██║███████╗███████╗██████╔╝███████║
  ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ╚══════╝
  */

  @Csv(21)
  imgsrc?: string

  @Csv(0, escapeCsv)
  display?: string

  @Csv(1, (s?: string[]) => escapeCsv(s?.join('\\n')))
  tooltips?: string[]

  /**
   * Recipes that has this item as output
   */
  declare recipes: [Recipe, IngrAmount][] | undefined

  declare mainRecipe: Recipe | undefined

  declare dependencies: Set<Recipe> | undefined

  @Csv(21.5)
  get labels() {
    const isLabeled: Record<keyof typeof LabelSetup, () => boolean> = {
      Bottleneck: () => (this.recipes ?? []).filter(([r]) => r.purity > 0).length === 1,
      Alone: () => this.purity > 0 && [...this.dependencies ?? []].filter(r => r.purity > 0).length === 1,
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
      (this.recipes ?? []).map(([r]) => r.index),
      i => (i === this.mainRecipe?.index ? -1 : 0), // Main recipe always first
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
    public readonly sNbt: string | undefined,
  ) {
    super(id)
  }

  override toString(options?: { complexityPad?: number, short?: boolean }) {
    const display = `"${this.display}" ${this.id}`
    if (options?.short)
      return display
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
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}
