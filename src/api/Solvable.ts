import type { Calculable, Identified, IngrAmount, SolvableRecipe } from '.'
import { escapeCsv, sum } from '../lib/utils'
import { Csv } from '../tools/CsvDecorators'

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
    return this.naturalCost || (bestRecipe?.[0]?.cost ?? Number.POSITIVE_INFINITY) / (bestRecipe?.[1] ?? 1.0)
  }

  processingFor(amount: IngrAmount) {
    return this.naturalCost ? 0.0 : this.bestRecipe(amount)?.[0]?.processing ?? Number.POSITIVE_INFINITY
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

function recipeComparator(amount: number): (a: RecipeForAmount<SolvableRecipe<any>>, b: RecipeForAmount<SolvableRecipe<any>>) => number {
  return ([recA, amountA = 1.0], [recB, amountB = 1.0]) => recB.purity - recA.purity
    || (recA.cost * amount / amountA + recA.processing) - (recB.cost * amount / amountB + recB.processing)
    || averagePurity(recB) - averagePurity(recA)
    || unpureNiceScore(recB) - unpureNiceScore(recA)
}

function averagePurity(a: SolvableRecipe<Solvable<any>>): number {
  return a.requirments.reduce(
    (c, d) => c + Math.max(...[...d.it.matchedBy()].map(o => o.purity)),
    0.0,
  ) / a.requirments.length
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
