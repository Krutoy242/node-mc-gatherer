import Definition from './Definition'
import Stack from './Stack'

export default class Ingredient {
  static store = new Map<string, Ingredient>()

  static fromString(
    id: string,
    getById: (id: string) => Definition
  ): Ingredient {
    if (id === '') throw new Error('Ingredient cannot be empty')
    return (
      Ingredient.store.get(id) ??
      new Ingredient(
        id.split('|').map((s) => getById(s)),
        id
      )
    )
  }

  static fromDefs(items: Definition[]): Ingredient {
    const id = items.map((d) => d.id).join('|')
    return Ingredient.store.get(id) ?? new Ingredient(items, id)
  }

  id: string
  private matchedCache?: Definition[]

  private constructor(public readonly items: Definition[], id: string) {
    if (items.length === 0)
      throw new Error('Ingredient must content at least 1 Definition')

    if (items.length > 2000) {
      throw new Error('Ingredient list too large, might be error')
    }

    this.id = id
    Ingredient.store.set(id, this)
  }

  public dependenciesCount(): number {
    return this.items.reduce(
      (c, d) => Math.max(c, d.dependencies?.size ?? 0),
      0
    )
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
      .map((d) => (options?.names ? ` ${d.toString({ short: true })} ` : d.id))
      .join('|')
  }
}
