import type { Ingredient } from '../../api/Ingredient'
import type { IngredientStore } from '../../api/IngredientStore'
import type { Stack } from '../../api/Stack'
import type CLIHelper from '../../tools/cli-tools'
import type Definition from '../items/Definition'
import type DefinitionStore from '../items/DefinitionStore'
import type Recipe from '../recipes/Recipe'
import predefined from '../../custom/predefined'
import { createFileLogger } from '../../log/logger'
import { naturalSort } from '../utils'

const sleep = () => new Promise(resolve => setTimeout(resolve, 1))

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[],
    private ingredientStore: IngredientStore<Definition>,
  ) {}

  async compute(cli: CLIHelper) {
    this.createLinks(cli)

    let dirtyRecipes = new Set<Recipe>()

    this.assignPredefined((r: Recipe) => dirtyRecipes.add(r))
    this.definitionStore.locked = true

    // ------------------------
    // Progress Bars
    const cliBars = {
      Recipes: this.recipeStore.length,
      Items: this.definitionStore.size,
    }
    cli.startProgress(Object.keys(cliBars), Object.values(cliBars))
    function updateBarRecipes(total: number, inQueue: number) {
      cli.bars?.[0].update(total, { task: `In queue: ${cli.num(inQueue)}` })
    }
    function updateBarItems(recalcDefs: number) {
      cli.bars?.[1].update({ task: `Recalculated: ${cli.num(recalcDefs)}` })
    }
    await sleep()
    // ------------------------

    const recalculated = Array.from({ length: this.recipeStore.length }).fill(0) as number[]
    let totalCalculated = 0

    let i = 0
    let recalcDefs = 0
    while (dirtyRecipes.size) {
      const newDirtyRecipes = new Set<Recipe>()
      for (const rec of dirtyRecipes) {
        if (++i % 1000 === 0) {
          updateBarRecipes(totalCalculated, dirtyRecipes.size)
          updateBarItems(recalcDefs)
          recalcDefs = 0
          await sleep()
        }

        const oldPurity = rec.purity

        if (!rec.calculate())
          continue

        recalculated[rec.index]++
        if (oldPurity <= 0)
          totalCalculated++

        rec.outputs.forEach(stack =>
          recalcDefs += this.calcStack(
            stack,
            r => newDirtyRecipes.add(r),
            () => cli.bars?.[1].increment(),
          ),
        )
      }
      dirtyRecipes = newDirtyRecipes
    }

    cli.multBarStop?.()
    await sleep()

    // Recalculate all the processing costs
    cli.write('Recalculating Processing...')
    this.recipeStore.forEach(rec => rec.calculate())

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

      rec.outputs.forEach(({ it: ingredient, amount }) => {
        for (const def of this.definitionStore.matchedBy(ingredient)) {
          def.recipes ??= []
          if (!def.recipes.find(([r]) => r === rec))
            def.recipes.push([rec, amount])
        }
      })

      if (i % 20 === 0 || i === this.recipeStore.length - 1)
        cli.bar?.update(i + 1)
    })
    cli.bar?.update(this.recipeStore.length, { task: 'done' })
  }

  private calcStack(
    stack: Stack<Ingredient<Definition>>,
    addDirty: (r: Recipe) => void,
    onRecalc: () => void,
  ) {
    let recalcDefs = 0
    for (const def of stack.it.matchedBy()) {
      def.dependencies?.forEach(addDirty)

      if (def.markDirty() && def.purity > 0)
        onRecalc()

      recalcDefs++
    }

    return recalcDefs
  }

  private assignPredefined(addDirty: (r: Recipe) => void) {
    Object.entries(predefined).forEach(([id, cost]) => {
      const ingr = this.ingredientStore.get(id)
      for (const def of this.definitionStore.matchedBy(ingr)) {
        def.naturalCost = cost
        def.dependencies?.forEach(addDirty)
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
            `${r}`.padEnd(6) + this.recipeStore[i].toString({ short: true }),
        )
        .join('\n'),
    )

    createFileLogger('needRecipes.log')(
      this.needRecipes([...this.ingredientStore]),
    )
  }

  private needRecipes(allIngredients: Ingredient<Definition>[]): string {
    const unpureIngredients = allIngredients.filter(g =>
      g.items.every(d => d.purity <= 0),
    )

    const ingrTuples = unpureIngredients.map(
      ingr => [
        this.dependenciesCount(ingr),
        ingr,
        ingr.items.some(it =>
          [...it.dependencies?.values() ?? []].some(r =>
            r.outputs.some(di => di.it.items.every(d => d.purity <= 0)),
          ),
        ),
      ] as const,
    )
      .filter(([a]) => a > 0)

    return ingrTuples.map(([n, ingr, isImportant]) =>
      `${isImportant ? '! ' : ''}${n} ${this.needRecSerialize(ingr)}`,
    )
      .sort((a, b) => (Number(b.startsWith('!')) - Number(a.startsWith('!'))) || naturalSort(b, a))
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
        if (recipeWanted(r))
          deps.add(r)
      })
    })

    // Iterate over their dependencies
    if (deps.size > 1000)
      return 1000
    const checkList = [...deps]
    let r: Recipe | undefined
    // eslint-disable-next-line no-cond-assign
    while ((r = checkList.pop())) {
      for (const out of r.outputs) {
        for (const it of out.it.items) {
          if (it.purity <= 0) {
            for (const rr of it.dependencies ?? []) {
              if (!deps.has(rr) && recipeWanted(rr)) {
                deps.add(rr)
                checkList.push(rr)
                if (deps.size > 1000)
                  return 1000 // Deps too big, most likely problem with calc
              }
            }
          }
        }
      }
    }

    return deps.size
  }
}
