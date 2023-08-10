import type Recipe from '../recipes/Recipe'
import { fluent } from '../utils'

import type Definition from './Definition'
import type { DefinitionStack } from './DefinitionStack'

export function futilable(_target: any, _Key: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    if ((this as Inventory).futile) return
    return originalMethod.apply(this, args)
  }
  return descriptor
}

/**
 * List of items that you must have
 * Usually means list of catalysts (machines on your base)
 */
export default class Inventory {
  processing = 1.0

  /** List of items you need as catalists */
  private storage = new Map<Definition, number>()

  /** This recipe require itself to craft */
  private isDupe = false

  /**
   * List of recipes you need to reach target item
   * Only need to calculate `steps`
   */
  private stepsRecipes = new Set<Recipe>()

  get steps(): number {
    return this.futile ? 0 : this.stepsRecipes.size
  }

  constructor(private treshold: number, private recipe: Recipe) {
    this.stepsRecipes.add(recipe)
  }

  get futile() {
    return this.isDupe || this.processing >= this.treshold
  }

  @fluent @futilable // @ts-expect-error this
  addCatalysts(microStacks: DefinitionStack[]): this {
    microStacks.forEach(ms => this.mergeSingle(ms.it, ms.amount))
    this.addCatalystsOf(microStacks)
  }

  @fluent @futilable // @ts-expect-error this
  addCatalystsOf(microStacks: DefinitionStack[]): this {
    for (const ms of microStacks) {
      const r = ms.it.mainRecipe
      if (!r || !r.inventory) continue

      for (const rec of r.inventory.stepsRecipes) this.mergeRecipe(rec)
      for (const [def, amount] of r.inventory.storage) this.mergeSingle(def, amount)
    }
  }

  @futilable
  private mergeRecipe(r: Recipe): void {
    if (r === this.recipe) {
      this.isDupe = true
      return
    }
    if (this.stepsRecipes.has(r)) return
    this.stepsRecipes.add(r)
    this.processing += 1.0
  }

  @futilable
  private mergeSingle(def: Definition, amount?: number): void {
    const newAmount = amount ?? 1
    const oldAmount = this.storage.get(def)
    if (oldAmount !== undefined && oldAmount >= newAmount) return
    this.storage.set(def, newAmount)
    const addedAmount = newAmount - (oldAmount ?? 0)
    this.processing += addedAmount * def.cost
  }
}
