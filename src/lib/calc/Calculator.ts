import _ from 'lodash'

import predefined from '../../custom/predefined'
import { createFileLogger } from '../../log/logger'
import CLIHelper from '../../tools/cli-tools'
import Definition from '../items/Definition'
import DefinitionStore from '../items/DefinitionStore'
import Stack from '../items/Stack'
import Recipe from '../recipes/Recipe'

import Calculable from './Calculable'

// eslint-disable-next-line no-promise-executor-return
const sleep = () => new Promise((r) => setTimeout(r, 1))

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[]
  ) {}

  async compute(cli: CLIHelper) {
    cli.startProgress('Linking items', this.recipeStore.length)
    this.definitionStore.lock()

    // Create links between items
    this.recipeStore.forEach((rec, index) => {
      rec.requirments.forEach(({ ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          ;(def.dependencies ??= new Set()).add(index)
        }
      })

      rec.outputs.forEach(({ ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          ;(def.recipes ??= new Set()).add(index)
        }
      })

      if (index % 100 === 0 || index === this.recipeStore.length - 1)
        cli.bar?.update(index + 1)
    })
    cli.bar?.update(this.recipeStore.length, { task: 'done' })

    // Assign predefined values
    let dirtyRecipes = new Set<number>()
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

    const cliBars = {
      Recipes: this.recipeStore.length,
      Items: this.definitionStore.size,
    }
    cli.startProgress(Object.keys(cliBars), Object.values(cliBars))
    await sleep()

    const recalculated = new Array<number>(this.recipeStore.length).fill(0)
    let totalCalculated = 0

    while (dirtyRecipes.size) {
      const newDirty = new Set<number>()
      dirtyRecipes.forEach((r) => {
        const rec = this.recipeStore[r]
        const oldPurity = rec.purity
        if (!this.calcRecipe(rec)) return

        recalculated[r]++
        if (oldPurity <= 0) totalCalculated++

        rec.outputs.forEach((out) => {
          const def_cost = rec.cost / (out.amount ?? 1)
          const calc = {
            purity: rec.purity,
            cost: def_cost,
            processing: rec.processing,
            complexity: def_cost + rec.processing,
          }

          for (const def of this.definitionStore.matchedBy(out.ingredient)) {
            if (this.calcDefinition(def, calc, newDirty))
              cli.bars?.[1].increment()
          }
        })
      })
      dirtyRecipes = newDirty

      cli.bars?.[0].update(totalCalculated, {
        task: 'Recalculated: ' + cli.num(dirtyRecipes.size),
      })

      await sleep()
    }
    cli.multBarStop?.()
    await sleep()

    cli.write('Writing computed in file...')
    createFileLogger('computed.log')(this.definitionStore.toString())
    createFileLogger('recalc.log')(
      recalculated
        .map((r, i) => [i, r])
        .filter(([, r]) => r > 1)
        .sort(([, a], [, b]) => b - a)
        .map(
          ([i, r]) =>
            `${r}`.padEnd(6) + this.recipeStore[i].toString({ short: true })
        )
        .join('\n')
    )

    const allDefs = [...this.definitionStore.iterate()]
    const totalWithPurity = allDefs.filter((def) => def.purity > 0).length

    createFileLogger('needRecipes.log')(
      allDefs
        .filter((d) => d.purity <= 0 && d.dependencies?.size)
        .map((d) => [d.dependencies!.size, d.toString()] as const)
        .sort(([a], [b]) => b - a)
        .map(([n, s]) => `${n} ${s}`)
        .join('\n')
    )

    return totalWithPurity
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
      (a, b) => a * this.getMinMax(b, 'purity', 'max'),
      1.0
    )
  }

  private getStacksSumm(field: keyof Calculable, arr?: Stack[]): number {
    if (!arr) return 0.0
    return arr
      .map((stack) => (stack.amount ?? 1) * this.getMinMax(stack, field, 'min'))
      .reduce((a, b) => a + b, 0)
  }

  private getMinMax(ingr: Stack, field: keyof Calculable, math: 'min' | 'max') {
    let val = math === 'max' ? -Infinity : Infinity
    for (const def of this.definitionStore.matchedBy(ingr.ingredient)) {
      if (math === 'min') {
        if (def[field] < val) val = def[field]
      } else if (def[field] > val) val = def[field]
    }
    if (val === Infinity || val === -Infinity) {
      throw new Error('No matched ingredients found')
    }
    return val
  }

  /**
   *
   * @param def
   * @param cal
   * @param dirtyRecipes
   * @returns `true` if recipe was calculated for the first time
   */
  private calcDefinition(
    def: Definition,
    cal: Calculable,
    dirtyRecipes: Set<number>
  ): boolean {
    if (def.purity > cal.purity) return false
    if (def.purity === cal.purity && def.complexity <= cal.complexity)
      return false
    const isFirtCalc = def.purity === 0
    def.purity = cal.purity
    def.cost = cal.cost
    def.processing = cal.processing
    def.complexity = cal.complexity
    def.dependencies?.forEach((r) => dirtyRecipes.add(r))
    return isFirtCalc
  }
}
