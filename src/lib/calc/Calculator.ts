import type { Ingredient, IngredientStore, Stack } from '../../api'
import predefined from '../../custom/predefined'
import { createFileLogger } from '../../log/logger'
import type CLIHelper from '../../tools/cli-tools'
import type Definition from '../items/Definition'
import type DefinitionStore from '../items/DefinitionStore'
import type Recipe from '../recipes/Recipe'
import { naturalSort } from '../utils'

const sleep = () => new Promise(resolve => setTimeout(resolve, 1))

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[],
    private ingredientStore: IngredientStore<Definition>
  ) {}

  async compute(cli: CLIHelper) {
    this.createLinks(cli)

    let dirtyRecipes = new Set<Recipe>()
    this.assignPredefined(dirtyRecipes)
    this.definitionStore.locked = true

    const cliBars = {
      Recipes: this.recipeStore.length,
      Items  : this.definitionStore.size,
    }
    cli.startProgress(Object.keys(cliBars), Object.values(cliBars))
    await sleep()

    const recalculated = new Array<number>(this.recipeStore.length).fill(0)
    let totalCalculated = 0

    let iters = 0
    let recalcDefs = 0
    while (dirtyRecipes.size) {
      const newDirtyRecipes = new Set<Recipe>()
      for (const rec of dirtyRecipes) {
        if (++iters % 1000 === 0) {
          cli.bars?.[0].update(totalCalculated, { task: `In queue: ${cli.num(dirtyRecipes.size)}` })
          cli.bars?.[1].update({ task: `Recalculated: ${cli.num(recalcDefs)}` })
          recalcDefs = 0
          await sleep()
        }

        const oldPurity = rec.purity

        if (!rec.calculate()) continue

        recalculated[rec.index]++
        if (oldPurity <= 0) totalCalculated++

        rec.outputs.forEach(stack =>
          recalcDefs += this.calcStack(stack, rec, newDirtyRecipes, cli)
        )
      }
      dirtyRecipes = newDirtyRecipes
    }
    cli.multBarStop?.()
    await sleep()

    cli.write('Writing computed in file...')
    this.logInfo(recalculated)
    const allDefs = [...this.definitionStore]
    const totalWithPurity = allDefs.filter(def => def.purity > 0).length

    return totalWithPurity
  }

  private createLinks(cli: CLIHelper) {
    cli.startProgress('Linking items', this.recipeStore.length)
    this.recipeStore.forEach((rec, i) => {
      rec.requirments.forEach(({ it: ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) (def.dependencies ??= new Set()).add(rec)
      })

      rec.outputs.forEach(({ it: ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) (def.recipes ??= new Set()).add(rec)
      })

      if (i % 20 === 0 || i === this.recipeStore.length - 1) cli.bar?.update(i + 1)
    })
    cli.bar?.update(this.recipeStore.length, { task: 'done' })
  }

  private calcStack(
    stack: Stack<Ingredient<Definition>>,
    rec: Recipe,
    dirtyRecipes: Set<Recipe>,
    cli: CLIHelper
  ) {
    let recalcDefs = 0
    for (const def of stack.it.matchedBy()) {
      const isFirtCalc = def.purity <= 0
      if (!def.suggest(rec, stack.amount ?? 1)) continue

      def.dependencies?.forEach(r => dirtyRecipes.add(r))
      if (isFirtCalc) cli.bars?.[1].increment()
      recalcDefs++
    }

    return recalcDefs
  }

  private assignPredefined(dirtyRecipes: Set<Recipe>) {
    Object.entries(predefined).forEach(([id, val]) => {
      const ingr = this.ingredientStore.get(id)
      for (const def of this.definitionStore.matchedBy(ingr)) {
        def.set({ purity: 1.0, cost: val, processing: 0.0 })
        def.dependencies?.forEach(r => dirtyRecipes.add(r))
      }
    })
  }

  private logInfo(recalculated: number[]) {
    createFileLogger('recalc.log')(
      recalculated
        .map((r, i) => [i, r])
        .filter(([, r]) => r > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 200)
        .map(
          ([i, r]) =>
            `${r}`.padEnd(6) + this.recipeStore[i].toString({ short: true })
        )
        .join('\n')
    )

    createFileLogger('needRecipes.log')(
      this.needRecipes([...this.ingredientStore])
    )
  }

  private needRecipes(allIngredients: Ingredient<Definition>[]): string {
    const unpureIngredients = allIngredients.filter(g =>
      g.items.every(d => d.purity <= 0)
    )

    const ingrTuples = unpureIngredients.map(
      ingr => [
        this.dependenciesCount(ingr),
        ingr,
        ingr.items.some(it =>
          [...it.dependencies?.values() ?? []].some(r =>
            r.outputs.some(di => di.it.items.every(d => d.purity <= 0))
          )
        ),
      ] as const
    )
      .filter(([a]) => a > 0)
      .sort(([a,,ai], [b,,bi]) => (Number(bi) - Number(ai)) || (b - a))

    return ingrTuples.map(([n, ingr, isImportant]) =>
      `${isImportant ? '! ' : ''}${n} ${this.needRecSerialize(ingr)}`
    )
      .sort((a, b) => naturalSort(b, a))
      .join('\n')
  }

  private needRecSerialize(ingr: Ingredient<Definition>): string {
    return ingr.toString({ names: true }).substring(0, 220)
  }

  private dependenciesCount(ingr: Ingredient<Definition>): number {
    function recipeWanted(rec: Recipe): boolean {
      return (
        rec.purity <= 0
        || rec.outputs.some(s => s.it.items.every(d => d.purity <= 0))
      )
    }

    // Find all wanted recipes
    const deps = new Set<Recipe>()
    ingr.items.forEach((it) => {
      it.dependencies?.forEach((r) => {
        if (recipeWanted(r)) deps.add(r)
      })
    })

    // Iterate over their dependencies
    if (deps.size > 1000) return 1000
    const checkList = [...deps]
    let r: Recipe | undefined
    while ((r = checkList.pop())) {
      for (const out of r.outputs) {
        for (const it of out.it.items) {
          if (it.purity <= 0) {
            for (const rr of it.dependencies ?? []) {
              if (!deps.has(rr) && recipeWanted(rr)) {
                deps.add(rr)
                checkList.push(rr)
                if (deps.size > 1000) return 1000 // Deps too big, most likely problem with calc
              }
            }
          }
        }
      }
    }

    return deps.size
  }
}
