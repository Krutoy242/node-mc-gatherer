import type { Calculable, Identified, IngrAmount, SolvableRecipe } from '.'
import { escapeCsv, sum } from '../lib/utils'
import { Csv } from '../tools/CsvDecorators'

export type RecipeForAmount<T> = readonly [T, IngrAmount]

export default class Solvable<R extends SolvableRecipe<any>> implements Identified, Calculable {
  @Csv(23, escapeCsv)
  readonly id: string

  /** Recipe and output amount of this item */
  recipes: RecipeForAmount<R>[] | undefined

  /** Cheapest recipe with amount == 1 */
  mainRecipe: R | undefined

  mainRecipeAmount: IngrAmount

  /**
   * Recipes that depends on this item
   */
  dependencies: Set<R> | undefined

  /** Predefined, hardcoded cost of the item */
  naturalCost?: number

  /** For 1 item */
  @Csv(12) get cost() {
    return this.naturalCost || (this.mainRecipe?.cost ?? Number.POSITIVE_INFINITY) / (this.mainRecipeAmount ?? 1.0)
  }

  /** For 1 item */
  @Csv(13) get processing() {
    return this.naturalCost ? 0.0 : this.mainRecipe?.processing ?? Number.POSITIVE_INFINITY
  }

  @Csv(10) get purity() {
    return this.naturalCost ? 1.0 : this.mainRecipe?.purity ?? 0.0
  }

  /** For 1 item */
  @Csv(11) get complexity() {
    return this.cost + this.processing
  }

  constructor(id: string) { this.id = id }

  /**
   * Find best recipe for this item for this amount
   */
  bestRecipe(
    amount: number,
  ) {
    const sortedArr = this.recipes?.sort(([recA, amountA], [recB, amountB]) => {
      return recB.purity - recA.purity
        || (recA.cost * (amountA ?? 1) * amount + recA.processing) - (recB.cost * (amountB ?? 1) * amount + recB.processing)
        || averagePurity(recB) - averagePurity(recA)
        || unpureNiceScore(recB) - unpureNiceScore(recA)
    })

    return sortedArr?.[0]
  }

  /**
   * Suggest recipe to be chosen as main
   * @returns `true` if calculable values was changed
   */
  suggest(rec: R, amount: number): boolean {
    if (this.purity > rec.purity)
      return false
    if (this.purity < rec.purity)
      return this.setRecipe(rec, amount)
    if (this.complexity <= rec.complexity)
      return false
    return this.setRecipe(rec, amount)
  }

  private setRecipe(rec: R, amount: number) {
    this.mainRecipe = rec
    this.mainRecipeAmount = amount
    return true
  }
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
