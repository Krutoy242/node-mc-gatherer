import type { Calculable, Identified, IngrAmount, SolvableRecipe } from '.'
import { escapeCsv, sum } from '../lib/utils'
import { Csv } from '../tools/CsvDecorators'

const INF = Number.POSITIVE_INFINITY

export type RecipeForAmount<T> = readonly [T, IngrAmount]

export default class Solvable<R extends SolvableRecipe<any>> implements Identified, Calculable {
  @Csv(23, escapeCsv)
  readonly id: string

  /** Recipe and output amount of this item */
  recipes: RecipeForAmount<R>[] | undefined

  /**
   * Recipes that depends on this item
   */
  dependencies: Set<R> | undefined

  /** Predefined, hardcoded cost of the item */
  naturalCost?: number

  /** For 1 item */
  @Csv(12) get cost() {
    return this.costFor(1)
  }

  /** For 1 item */
  @Csv(13) get processing() {
    return this.processingFor(1)
  }

  private maxPurity = 0.0
  @Csv(10) get purity() {
    if (this.maxPurity >= 1)
      return 1.0

    const newPurity = this.naturalCost
      ? 1.0
      : this.recipes
        ? Math.max(...this.recipes.map(([r]) => r.purity))
        : 0.0

    this.maxPurity = Math.max(this.maxPurity, newPurity)
    return this.maxPurity
  }

  /** For 1 item */
  @Csv(11) get complexity() {
    return this.complexityFor(1)
  }

  costFor(amount: IngrAmount) {
    const bestRecipe = this.bestRecipe(amount)
    return this.naturalCost || (bestRecipe?.[0]?.cost ?? INF) / (bestRecipe?.[1] ?? 1.0)
  }

  processingFor(amount: IngrAmount) {
    return this.naturalCost ? 0.0 : this.bestRecipe(amount)?.[0]?.processing ?? INF
  }

  complexityFor(amount: IngrAmount) {
    return this.costFor(amount) + this.processingFor(amount)
  }

  constructor(id: string) { this.id = id }

  /** Cache for fast accessing best recipes */
  private bestRecipeCache?: Map<number, RecipeForAmount<R>>

  /**
   * Find best recipe for this item for this amount
   */
  bestRecipe(amount = 1): RecipeForAmount<R> | undefined {
    if (this.recipes?.length === 1)
      return this.recipes[0]

    if (this.bestRecipeCache?.has(amount))
      return this.bestRecipeCache.get(amount)

    if (!this.recipes || !this.recipes.length)
      return

    const recipe = this.recipes.sort(recipeComparator(amount))[0]

    ;(this.bestRecipeCache ??= new Map()).set(amount, recipe)

    return recipe
  }

  markDirty() {
    this.bestRecipeCache?.clear()
    return this.maxPurity <= 0
  }
}

function recipeComparator(amount: number) {
  function sorter([recA, amountA = 1.0]: RecipeForAmount<SolvableRecipe<Solvable<any>>>, [recB, amountB = 1.0]: RecipeForAmount<SolvableRecipe<Solvable<any>>>) {
    const purityDiff = recB.purity - recA.purity
    if (purityDiff)
      return purityDiff

    const a = recA.cost === INF || recA.processing === INF ? INF : recA.cost * amount / amountA + recA.processing
    const b = recB.cost === INF || recB.processing === INF ? INF : recB.cost * amount / amountB + recB.processing

    return a - b
    // || averagePurity(recB) - averagePurity(recA)
    // || unpureNiceScore(recB) - unpureNiceScore(recA)
  }
  return sorter
}

/*
function averagePurity(a: SolvableRecipe<Solvable<any>>): number {
  let sum = 0
  for (const stack of a.requirments) {
    let max = 0
    for (const it of stack.it.matchedBy()) {
      const p = it.purity
      if (p > max)
        max = p
    }
    sum += max
  }
  return sum / a.requirments.length
}

function unpureNiceScore(a: SolvableRecipe<Solvable<any>>): number {
  return sum([
    1 - 1 / (sum(a.requirments.map(s => s.it.items.length)) + 1),
    a.catalysts?.length === 1 ? 0.25 : 0,
    // Number(a.catalysts?.[0]?.it.id !== 'minecraft:crafting_table:0'),
    (sum(a.outputs.map(s => s.amount ?? 0)) + 1) / 10,
    Number(a.inputs?.every(s => s.it.items.every(i => i.id.startsWith('minecraft')))),
  ])
}
*/
