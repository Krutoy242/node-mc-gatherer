import _ from 'lodash'

import predefined from '../adapters/predefined'
import { createFileLogger } from '../log/logger'

import Calculable from './Calculable'
import DefinitionStore, { Definition } from './DefinitionStore'
import Recipe from './Recipe'
import Stack from './Stack'

const logComputed = createFileLogger('computed.log')

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[]
  ) {}

  compute() {
    console.log('🧮  Starting calculations... ')

    let dirtyRecipes = new Set<number>()

    // Assign predefined values
    Object.entries(predefined).forEach(([id, val]) =>
      this.calcDefinition(
        this.definitionStore.get(`placeholder:${id}`),
        {
          purity: 1.0,
          cost: val,
          processing: 0.0,
          complexity: val,
        },
        dirtyRecipes
      )
    )

    while (dirtyRecipes.size) {
      const newDirty = new Set<number>()
      dirtyRecipes.forEach((r) => {
        const rec = this.recipeStore[r]
        if (this.calcRecipe(rec)) {
          rec.outputs.forEach((out) => {
            const def_cost = rec.cost / out.amount
            this.calcDefinition(
              out.definition,
              {
                purity: rec.purity,
                cost: def_cost,
                processing: rec.processing,
                complexity: def_cost + rec.processing,
              },
              newDirty
            )
          })
        }
      })
      dirtyRecipes = newDirty
    }

    const computedArr = Object.values(this.definitionStore.store)
      .filter((def) => def.complexity !== 0)
      .sort((a, b) => a.complexity - b.complexity)
      .map(
        (d) => `${getPurity(d.purity)}${d.complexity} "${d.display}" ${d.id}`
      )

    function getPurity(purity: number): string {
      return `▕${'█▇▆▅▄▃▂▁'[-Math.log2(purity) | 0] ?? ' '}▏`
    }

    console.log('Succesfully computed:', computedArr.length)
    logComputed(computedArr.join('\n'))
  }

  /**
   * Calculate recipe
   * @returns `true` if new value calculated, `false` if not changed or unable to
   */
  private calcRecipe(rec: Recipe): boolean {
    const purity =
      (this.getStacksMean(rec.inputs, 'purity') +
        this.getStacksMean(rec.catalysts, 'purity')) /
      ((rec.inputs?.length ? 1 : 0) + (rec.catalysts?.length ? 1 : 0))
    if (rec.purity > purity) return false

    const cost = this.getStacksSumm(rec.inputs, 'complexity') + 1.0
    const processing = this.getStacksSumm(rec.catalysts, 'complexity') + 1.0
    const complexity = cost + processing
    if (rec.complexity === complexity) return false
    if (rec.purity === purity && rec.complexity < complexity) return false

    rec.purity = purity
    rec.cost = cost
    rec.processing = processing
    rec.complexity = complexity

    return true
  }

  private getStacksMean(
    arr: Stack[] | undefined,
    field: keyof Calculable
  ): number {
    if (!arr || !arr.length) return 0.0
    let count = 0.0
    let total = 0.0
    arr.forEach((stack) => {
      count += stack.amount
      total += stack.definition[field]
    })
    return total / count
  }

  private getStacksSumm(
    arr: Stack[] | undefined,
    field: keyof Calculable
  ): number {
    if (!arr) return 0.0
    return arr
      .map((s) => s.amount * s.definition[field])
      .reduce((a, b) => a + b, 0)
  }

  private calcDefinition(
    def: Definition,
    cal: Calculable,
    dirtyRecipes: Set<number>
  ): boolean {
    if (def.purity > cal.purity) return false
    if (def.purity === cal.purity && def.complexity <= cal.complexity)
      return false
    def.purity = cal.purity
    def.cost = cal.cost
    def.processing = cal.processing
    def.complexity = cal.complexity
    def.dependencies?.forEach((r) => dirtyRecipes.add(r))
    return true
  }
}
