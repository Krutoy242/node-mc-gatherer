import Definition from './Definition'
import Stack from './Stack'

export default class Ingredient {
  static fromString(
    str: string,
    getById: (id: string) => Definition
  ): Ingredient {
    if (str === '') throw new Error('Ingredient cannot be empty')
    const items = str.split('|').map((s) => getById(s))
    const g = new Ingredient(items)
    g.id = str
    return g
  }

  id: string
  private matchedCache?: Definition[]

  constructor(public readonly items: Definition[], id?: string) {
    if (items.length === 0)
      throw new Error('Ingredient must content at least 1 Definition')

    if (items.length > 2000) {
      throw new Error('Ingredient list too large, might be error')
    }

    this.id = id ?? items.map((d) => d.id).join('|')
  }

  hasMatchedCache() {
    return !!this.matchedCache
  }

  matchedBy() {
    if (!this.matchedCache)
      throw new Error('Trying to acces ingredient matcher before cache')
    return this.matchedCache
  }

  setMatchedCache(cache: Definition[]) {
    this.matchedCache = cache
  }

  equals(other: Ingredient): boolean {
    if (this.items.length !== other.items.length) return false
    return this.items.every((it) => other.items.includes(it))
  }

  stack(amount?: number): Stack {
    return new Stack(this, amount)
  }

  toString(options?: { names?: boolean }): string {
    return this.items
      .map((d) => (options?.names ? d.toString({ short: true }) : d.id))
      .join('|')
  }
}
