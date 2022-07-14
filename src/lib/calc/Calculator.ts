import { Ingredient, IngredientStore, Stack } from '../../api'
import predefined from '../../custom/predefined'
import { createFileLogger } from '../../log/logger'
import CLIHelper from '../../tools/cli-tools'
import Definition from '../items/Definition'
import DefinitionStore from '../items/DefinitionStore'
import Recipe from '../recipes/Recipe'

// eslint-disable-next-line no-promise-executor-return
const sleep = () => new Promise((r) => setTimeout(r, 1))

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[],
    private ingredientStore: IngredientStore<Definition>
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

      if (!rec.calculate()) continue

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
    const allDefs = [...this.definitionStore]
    this.logInfo(recalculated)
    const totalWithPurity = allDefs.filter((def) => def.purity > 0).length

    return totalWithPurity
  }

  private createLinks(cli: CLIHelper) {
    cli.startProgress('Linking items', this.recipeStore.length)
    this.definitionStore.lock()
    this.recipeStore.forEach((rec, index) => {
      rec.requirments.forEach(({ it: ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          ;(def.dependencies ??= new Set()).add(index)
        }
      })

      rec.outputs.forEach(({ it: ingredient }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          ;(def.recipes ??= new Set()).add(rec)
        }
      })

      if (index % 100 === 0 || index === this.recipeStore.length - 1)
        cli.bar?.update(index + 1)
    })
    cli.bar?.update(this.recipeStore.length, { task: 'done' })
  }

  private calcStack(
    stack: Stack<Ingredient<Definition>>,
    rec: Recipe,
    dirtyRecipes: Set<number>,
    cli: CLIHelper
  ) {
    let recalcDefs = 0
    for (const def of stack.it.matchedBy()) {
      const isFirtCalc = def.purity <= 0
      if (def.suggest(rec, stack.amount ?? 1)) {
        def.dependencies?.forEach((r) => dirtyRecipes.add(r))
        if (isFirtCalc) cli.bars?.[1].increment()
        recalcDefs++
      }
    }

    return recalcDefs
  }

  private assignPredefined(dirtyRecipes: Set<number>) {
    Object.entries(predefined).forEach(([id, val]) => {
      const ingr = this.ingredientStore.get(id)
      for (const def of this.definitionStore.matchedBy(ingr)) {
        def.set({ purity: 1.0, cost: val, processing: 0.0 })
        def.dependencies?.forEach((r) => dirtyRecipes.add(r))
      }
    })
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
      this.needRecipes([...this.ingredientStore])
    )
  }

  private needRecipes(allIngredients: Ingredient<Definition>[]): string {
    const unpureIngredients = allIngredients.filter((g) =>
      g.items.every((d) => d.purity <= 0)
    )

    const ingrTuples = unpureIngredients.map(
      (g) => [this.dependenciesCount(g), g] as const
    )

    const filtSorted = ingrTuples
      .filter(([a]) => a > 0)
      .sort(([a], [b]) => b - a)

    return filtSorted
      .map(([n, ingr]) => `${n} ${this.needRecSerialize(ingr)}`)
      .join('\n')
  }

  private needRecSerialize(ingr: Ingredient<Definition>): string {
    return ingr.toString({ names: true }).substring(0, 220)
  }

  private dependenciesCount(ingr: Ingredient<Definition>): number {
    function recipeWanted(rec: Recipe): boolean {
      return (
        rec.purity <= 0 ||
        rec.outputs.some((s) => s.it.items.every((d) => d.purity <= 0))
      )
    }

    // Find all wanted recipes
    const deps = new Set<number>()
    ingr.items.forEach((it) => {
      it.dependencies?.forEach((r) => {
        if (recipeWanted(this.recipeStore[r])) deps.add(r)
      })
    })

    // Iterate over their dependencies
    const checkList = [...deps]
    let r: number | undefined
    while ((r = checkList.pop())) {
      this.recipeStore[r].outputs.forEach((out) =>
        out.it.items.forEach((it) => {
          if (it.purity <= 0)
            it.dependencies?.forEach((rr) => {
              if (!deps.has(rr) && recipeWanted(this.recipeStore[rr])) {
                deps.add(rr)
                checkList.push(rr)
              }
            })
        })
      )
    }

    return deps.size
  }
}
