import _ from 'lodash'

import predefined from '../../custom/predefined'
import { createFileLogger } from '../../log/logger'
import Definition from '../items/Definition'
import DefinitionStore from '../items/DefinitionStore'
import Stack from '../items/Stack'
import Recipe from '../recipes/Recipe'

import Calculable from './Calculable'

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
        this.definitionStore.getBased('placeholder', id),
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
        if (!this.calcRecipe(rec)) return

        rec.outputs.forEach((out) => {
          const def_cost = rec.cost / (out.amount ?? 1)
          const calc = {
            purity: rec.purity,
            cost: def_cost,
            processing: rec.processing,
            complexity: def_cost + rec.processing,
          }

          out.ingredient.items.forEach((def) =>
            this.calcDefinition(def, calc, newDirty)
          )
        })
      })
      dirtyRecipes = newDirty
    }

    console.log(
      'Succesfully computed:',
      [...this.definitionStore.iterate()].filter((def) => def.purity > 0).length
    )
    logComputed(this.definitionStore.toString())
  }

  /**
   * Calculate recipe
   * @returns `true` if new value calculated, `false` if not changed or unable to
   */
  private calcRecipe(rec: Recipe): boolean {
    const purity = this.recipePurity(rec)
    if (rec.purity > purity) return false

    const cost = this.getStacksSumm('cost', rec.inputs) + 1.0
    const processing = this.getStacksSumm('complexity', rec.catalysts) + 1.0
    const complexity = cost + processing
    if (rec.complexity === complexity) return false
    if (rec.purity === purity && rec.complexity < complexity) return false

    rec.purity = purity
    rec.cost = cost
    rec.processing = processing
    rec.complexity = complexity

    return true
  }

  private recipePurity(rec: Recipe): number {
    return rec.requirments.reduce(
      (a, b) => a * Math.max(...b.ingredient.items.map((o) => o.purity)),
      1.0
    )
  }

  private getStacksSumm(field: keyof Calculable, arr?: Stack[]): number {
    if (!arr) return 0.0
    return arr
      .map(
        (stack) =>
          (stack.amount ?? 1) *
          Math.min(...stack.ingredient.items.map((o) => o[field]))
      )
      .reduce((a, b) => a + b, 0)
  }

  private calcDefinition(
    def: Definition,
    cal: Calculable,
    dirtyRecipes: Set<number>
  ) {
    if (def.purity > cal.purity) return
    if (def.purity === cal.purity && def.complexity <= cal.complexity) return
    def.purity = cal.purity
    def.cost = cal.cost
    def.processing = cal.processing
    def.complexity = cal.complexity
    def.dependencies?.forEach((r) => dirtyRecipes.add(r))
    return
  }
}
