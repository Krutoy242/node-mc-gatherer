import type { Based, BaseVisible, Calculable, Labeled } from '../../api'
import type Recipe from '../recipes/Recipe'
import _ from 'lodash'

import { getPos } from 'mc-icons/build/lib/sprite'
import numeral from 'numeral'

import { LabelSetup } from '../../api'
import Solvable from '../../api/Solvable'
import { Csv } from '../../tools/CsvDecorators'
import { escapeCsv } from '../utils'
import 'reflect-metadata'

const infin = (n: number) => n === Number.POSITIVE_INFINITY ? 'Infinity' : undefined
const numFormat = (n: number) => infin(n) ?? numeral(n).format('0,0.00')
const siFormat = (n: number) => infin(n) ?? numeral(n).format('a').padStart(4)

// const logRecalc = createFileLogger('tmp_recalcOf.log')

export default class Definition extends Solvable<Recipe>
  implements Based, BaseVisible, Calculable, Labeled {
  /*
  ███████╗██╗███████╗██╗     ██████╗ ███████╗
  ██╔════╝██║██╔════╝██║     ██╔══██╗██╔════╝
  █████╗  ██║█████╗  ██║     ██║  ██║███████╗
  ██╔══╝  ██║██╔══╝  ██║     ██║  ██║╚════██║
  ██║     ██║███████╗███████╗██████╔╝███████║
  ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ ╚══════╝
  */

  @Csv(21, getPos)
  imgsrc?: string

  @Csv(0, escapeCsv)
  display?: string

  @Csv(1, (s?: string[]) => escapeCsv(s?.join('\\n')))
  tooltips?: string[]

  @Csv(21.5)
  get labels() {
    const isLabeled: Record<keyof typeof LabelSetup, () => boolean> = {
      Bottleneck: () => ((this.recipes ?? []).filter(([r]) => r.purity > 0).length === 1)
        && (this.purity > 0 && [...this.dependencies ?? []].filter(r => r.purity > 0).length === 1),

      Trash: () => (this.recipes ?? [])
        .filter(([r]) => r.complexity)
        .some(([r]) => r.inputs?.map(({ it, amount }) =>
          Math.min(
            ...it.matchedBy()
              .filter(d => Number.isFinite(d.complexity) && d.complexity > 0)
              .map(def => Math.log10(def.cost * (amount ?? 1) + def.processing)),
          ),
        )
          .sort()
          .some((v, i, arr) => i !== 0 && v / arr[i - 1] >= 10),
        ),
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
    const bestRecipe = this.bestRecipe()?.[0]
    return _.sortBy(
      (this.recipes ?? []).map(([r]) => r.index),
      i => (i === bestRecipe?.index ? -1 : 0), // Main recipe always first
    ).join(' ')
  }

  /** Indexes of recipes that depends on this item */
  @Csv(22.5)
  get depIndexes(): string {
    return [...(this.dependencies ?? [])].map(r => r.index).join(' ')
  }

  @Csv(20)
  get steps() {
    const bestRecipe = this.bestRecipe()?.[0]
    return bestRecipe?.inventory?.steps
      ? bestRecipe.inventory.steps + 1
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

  serialize(options?: { short?: boolean }) {
    const display = [`"${this.display?.replace(/§./g, '')}"`, this.id]
    return options?.short
      ? display
      : [
          getPurity(this.purity),
          this.complexity_s,
          `🧮${siFormat(this.cost)}`,
          `⚙️${siFormat(this.processing)}`,
          ...display,
        ]
  }

  override toString(options?: { short?: boolean }) {
    return this.serialize(options).join(' ')
  }

  get complexity_s(): string {
    return numFormat(this.complexity)
  }
}

function getPurity(n: number): string {
  return n === 0 ? '•' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
}
