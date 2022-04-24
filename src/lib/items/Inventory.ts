import Recipe from '../recipes/Recipe'

import Definition from './Definition'
import { MicroStack } from './Stack'

export default class Inventory {
  processing = 0.0

  private stepsRecipes = new Set<Recipe>()
  private storage = new Map<Definition, number>()
  private isDupe = false

  public get steps(): number {
    return this.isFutile() ? 0 : this.stepsRecipes.size
  }

  constructor(private treshold: number, private recipe: Recipe) {
    this.stepsRecipes.add(recipe)
    this.processing += 1.0
  }

  addCatalysts(microStacks: MicroStack[]) {
    if (this.isFutile()) return this
    microStacks.forEach((ms) => this.mergeSingle(ms.def, ms.amount))
    return this
  }

  addCatalystsOf(microStacks: MicroStack[]) {
    if (this.isFutile()) return this
    for (const ms of microStacks) {
      const r = ms.def.mainRecipe
      if (!r || !r.inventory) return this

      for (const rec of r.inventory.stepsRecipes) {
        this.mergeRecipe(rec)
      }

      for (const [def, amount] of r.inventory.storage) {
        this.mergeSingle(def, amount)
      }
    }
    return this
  }

  isFutile() {
    return this.isDupe || this.processing >= this.treshold
  }

  private mergeRecipe(r: Recipe): void {
    if (this.isFutile()) return
    if (r === this.recipe) {
      this.isDupe = true
      return
    }
    if (this.stepsRecipes.has(r)) return
    this.stepsRecipes.add(r)
    this.processing += 1.0
  }

  private mergeSingle(def: Definition, amount?: number): void {
    if (this.isFutile()) return
    const oldAmount = this.storage.get(def)
    const newAmount = amount ?? 1
    if (oldAmount !== undefined && oldAmount >= newAmount) return
    this.storage.set(def, newAmount)
    const added = newAmount - (oldAmount ?? 0)
    this.processing += added * def.cost
  }
}
