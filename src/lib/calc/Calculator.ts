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

export default class Calculator {
  constructor(
    private definitionStore: DefinitionStore,
    private recipeStore: Recipe[],
    private ingredientStore: IngredientStore<Definition>,
  ) {}

  async compute(cli: CLIHelper) {
    // Create links between items such as dependencies or recipes
    cli.startProgress('Linking items', this.recipeStore.length)
    this.createLinks(v => cli.bar?.update(v))
    cli.bar?.update(this.recipeStore.length, { task: 'done' })

    // Assign hardcoded costs
    let dirtyRecipes = new Set<Recipe>()
    this.assignPredefined(r => dirtyRecipes.add(r))

    // New entries cant be added to store from now
    this.definitionStore.locked = true

    // Progress
    const barsConfig = {
      Precalc: { max: 0 },
      Recipes: { max: this.recipeStore.length, comment: 'In queue' },
      Items: { max: this.definitionStore.size, comment: 'Recalculated' },
      Postcalc: { max: 1 },
    }
    const multibar = await cli.createMultibar(barsConfig)

    // Stats
    const recalculated = this.recipeStore.map(() => 0)
    let recalcDefs = 0
    let totalCalculated = 0

    // Recalculate single recipe
    const recalcRec = async (rec: Recipe, onDirty: (r: Recipe) => void) => {
      if (await multibar.update({
        Recipes: [totalCalculated, dirtyRecipes.size],
        Items: [undefined, recalcDefs],
      })) {
        recalcDefs = 0
      }

      const oldPurity = rec.purity

      if (!rec.calculate())
        return

      recalculated[rec.index]++
      if (oldPurity <= 0)
        totalCalculated++

      rec.outputs.forEach(stack =>
        recalcDefs += this.calcStack(
          stack,
          onDirty,
          () => cli.bars?.[2].increment(),
        ),
      )
    }

    const recalcAll = async (barName: keyof typeof barsConfig) => {
      for (let j = 0; j < barsConfig[barName].max; j++) {
        multibar.update({ [barName]: [j + 1] })
        for (const rec of this.recipeStore) {
          await recalcRec(rec, _ => 0)
        }
      }
    }

    // Preparing recalculation
    await recalcAll('Precalc')

    while (dirtyRecipes.size) {
      const newDirtyRecipes = new Set<Recipe>()
      for (const rec of dirtyRecipes) {
        await recalcRec(rec, r => newDirtyRecipes.add(r))
      }
      dirtyRecipes = newDirtyRecipes
    }

    // Finisher recalc
    await recalcAll('Postcalc')

    await multibar.stop()

    cli.write('Writing computed in file...')
    this.logInfo(recalculated)
    const allDefs = [...this.definitionStore]
    const totalWithPurity = allDefs.filter(def => def.purity > 0).length

    return totalWithPurity
  }

  private createLinks(onUpdate: (v: number) => void) {
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
        onUpdate(i + 1)
    })
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
