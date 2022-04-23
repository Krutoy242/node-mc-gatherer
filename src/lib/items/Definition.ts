import Calculable from '../calc/Calculable'
import Recipe from '../recipes/Recipe'

import Ingredient from './Ingredient'

export default class Definition implements Calculable {
  static actualMeta(meta?: string): string | undefined {
    return meta === undefined
      ? undefined
      : // eslint-disable-next-line eqeqeq
      meta == '32767'
      ? '*'
      : meta
  }

  static baseToId(
    source: string,
    entry: string,
    meta?: string,
    sNbt?: string
  ): string {
    const m = Definition.actualMeta(meta)
    return `${source}:${entry}${m !== undefined ? ':' + m : ''}${
      sNbt ? ':' + sNbt : ''
    }`
  }

  readonly id: string

  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0

  viewBox?: string
  display?: string

  /**
   * Recipes that has this item as output
   */
  recipes?: Set<number>

  mainRecipe?: Recipe

  /**
   * Recipes that depends on this item
   */
  dependencies?: Set<number>

  constructor(
    public readonly source: string,
    public readonly entry: string,
    public readonly meta?: string,
    public readonly sNbt?: string
  ) {
    this.id = Definition.baseToId(source, entry, meta, sNbt)
  }

  toString() {
    return `${getPurity(this.purity)}${this.complexity} "${this.display}" ${
      this.id
    }`
  }

  toIngredient() {
    return new Ingredient([this])
  }
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}
