import _ from 'lodash'

import predefined from '../../custom/predefined'
import { createFileLogger } from '../../log/logger'
import CLIHelper from '../../tools/cli-tools'
import Definition from '../items/Definition'
import DefinitionStore from '../items/DefinitionStore'
import Inventory from '../items/Inventory'
import Stack, { MicroStack } from '../items/Stack'
import Recipe from '../recipes/Recipe'

import Calculable from './Calculable'

const logRecalc = createFileLogger('tmp_recalcOf.log')

// eslint-disable-next-line no-promise-executor-return
const sleep = () => new Promise((r) => setTimeout(r, 1))

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[]
  ) {}

  async compute(cli: CLIHelper) {
    this.createLinks(cli)

    let dirtyRecipes = new Set<number>()
    this.assignPredefined(dirtyRecipes)

    const cliBars = {
      Recipes: this.recipeStore.length,
      Items: this.definitionStore.size,
    }
    cli.startProgress(Object.keys(cliBars), Object.values(cliBars))
    await sleep()

    const recalculated = new Array<number>(this.recipeStore.length).fill(0)
    let totalCalculated = 0

    let iters = 0
    let recalcDefs = 0
    while (dirtyRecipes.size) {
      iters++

      const [r] = dirtyRecipes
      dirtyRecipes.delete(r)

      const rec = this.recipeStore[r]
      const oldPurity = rec.purity

      if (!this.calcRecipe(rec)) continue

      recalculated[r]++
      if (oldPurity <= 0) totalCalculated++

      rec.outputs.forEach((stack) => {
        recalcDefs += this.calcStack(stack, rec, dirtyRecipes, cli)
      })

      if (iters % 10000 === 0) {
        cli.bars?.[0].update(totalCalculated, {
          task: `In queue: ${cli.num(dirtyRecipes.size)}`,
        })
        cli.bars?.[1].update({
          task: `Recalculated: ${cli.num(recalcDefs)}`,
        })
        recalcDefs = 0
        await sleep()
      }
    }
    cli.multBarStop?.()
    await sleep()

    cli.write('Writing computed in file...')
    const allDefs = [...this.definitionStore.iterate()]
    this.logInfo(recalculated)
    const totalWithPurity = allDefs.filter((def) => def.purity > 0).length

    return totalWithPurity
  }

  private createLinks(cli: CLIHelper) {
    cli.startProgress('Linking items', this.recipeStore.length)
    this.definitionStore.lock()
    this.recipeStore.forEach((rec, index) => {
      rec.requirments.forEach(({ ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          ;(def.dependencies ??= new Set()).add(index)
        }
      })

      rec.outputs.forEach(({ ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          ;(def.recipes ??= new Set()).add(rec)
        }
      })

      if (index % 100 === 0 || index === this.recipeStore.length - 1)
        cli.bar?.update(index + 1)
    })
    cli.bar?.update(this.recipeStore.length, { task: 'done' })
  }

  private assignPredefined(dirtyRecipes: Set<number>) {
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
  }

  /**
   * Calculate recipe
   * @returns `true` if new value calculated, `false` if not changed or unable to
   */
  private calcRecipe(rec: Recipe): boolean | undefined {
    const [catPurity, catDefs] = this.getBestDefs(rec.catalysts)
    if (catPurity <= 0) return

    const [inPurity, inDefs] = this.getBestDefs(rec.inputs)
    if (inPurity <= 0) return

    const purity = catPurity * inPurity
    if (rec.purity > purity) return
    const samePurity = rec.purity === purity

    const cost = inDefs.reduce((a, b) => a + (b.amount ?? 1) * b.def.cost, 1.0)
    if (samePurity && rec.complexity <= cost) return

    let catalList: Inventory | undefined
    if (catDefs.length || inDefs.some((d) => d.def.mainRecipe?.inventory)) {
      const maxCost = samePurity ? rec.complexity - cost : Infinity
      catalList = new Inventory(maxCost, rec)
        .addCatalysts(catDefs)
        .addCatalystsOf(catDefs)
        .addCatalystsOf(inDefs)
      if (catalList.isFutile()) return
    }
    const processing = catalList?.processing ?? 0

    const complexity = cost + processing
    if (rec.complexity === complexity) return
    if (samePurity && rec.complexity < complexity) return

    // Unsignificant difference, probably loop
    const diffFactor = (rec.complexity - complexity) / complexity
    if (samePurity && diffFactor < 0.0001) return

    rec.purity = purity
    rec.cost = cost
    rec.processing = processing
    rec.complexity = complexity
    rec.inventory = catalList

    return true
  }

  private getBestDefs(stacks?: Stack[]): [purity: number, defs: MicroStack[]] {
    if (!stacks) return [1.0, []]
    let purity = 1.0
    const defs: MicroStack[] = []
    for (const stack of stacks) {
      let minComp = Infinity
      let maxPur = 0.0
      let bestDef: Definition | undefined
      for (const def of this.definitionStore.matchedBy(stack.ingredient)) {
        if (
          def.purity > maxPur ||
          (def.purity === maxPur && def.complexity < minComp)
        ) {
          bestDef = def
          maxPur = def.purity
          minComp = def.complexity
        }
      }
      if (maxPur === 0) return [0, []]
      purity *= maxPur
      defs.push({ amount: stack.amount, def: bestDef as Definition })
    }
    return [purity, defs]
  }

  private calcStack(
    stack: Stack,
    rec: Recipe,
    dirtyRecipes: Set<number>,
    cli: CLIHelper
  ) {
    let recalcDefs = 0
    const def_cost = rec.cost / (stack.amount ?? 1)
    const calc = {
      purity: rec.purity,
      cost: def_cost,
      processing: rec.processing,
      complexity: def_cost + rec.processing,
    }

    for (const def of this.definitionStore.matchedBy(stack.ingredient)) {
      const isFirtCalc = def.purity <= 0
      if (this.calcDefinition(def, calc, dirtyRecipes, rec)) {
        if (isFirtCalc) cli.bars?.[1].increment()
        recalcDefs++
      }
    }

    return recalcDefs
  }

  /**
   * @returns `true` if recipe was calculated for the first time
   */
  private calcDefinition(
    def: Definition,
    cal: Calculable,
    dirtyRecipes: Set<number>,
    rec?: Recipe
  ): boolean {
    if (def.purity > cal.purity) return false
    if (def.purity === cal.purity && def.complexity <= cal.complexity)
      return false

    /* if (def.id === 'mekanism:gastank:0:{tier:4}') {
      if (def.mainRecipe) {
        const diff = def.mainRecipe.inventory?.difference(rec?.inventory)

        ;(
          [
            ['➖', 'removed'],
            ['➕', 'added'],
          ] as const
        ).forEach(([symbol, key]) => {
          if (diff?.[key].length)
            logRecalc(
              `${symbol}\n    ${diff?.[key]
                .map((r) =>
                  r.toString({ detailed: true }).split('\n').join('\n      ')
                )
                .join('\n    ')}\n`
            )
        })
      }
      logRecalc(rec?.toString({ detailed: true }) + '\n')
    } */

    def.purity = cal.purity
    def.cost = cal.cost
    def.processing = cal.processing
    def.complexity = cal.complexity
    def.mainRecipe = rec
    def.dependencies?.forEach((r) => dirtyRecipes.add(r))

    return true
  }

  private logInfo(recalculated: number[]) {
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

    createFileLogger('needRecipes.log')(
      this.definitionStore
        .getIngrsNeedRecipe()
        .map(
          ([n, ingr]) =>
            n + ' ' + ingr.toString({ names: true }).substring(0, 120)
        )
        .join('\n')
    )
  }
}
