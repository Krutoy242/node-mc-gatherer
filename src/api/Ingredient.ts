import type { Identified } from '.'

export class Ingredient<T extends Identified> implements Identified {
  static itemsToID(items: Identified[]): string {
    return items.map(({ id }) => id).join('|')
  }

  private matchedCache?: T[] | []

  constructor(public readonly items: T[], public id: string) {}

  hasMatchedCache() {
    return !!this.matchedCache
  }

  matchedBy(): T[] | [] {
    if (!this.matchedCache) throw new Error('Trying to acces ingredient matcher before cache')
    return this.matchedCache
  }

  matches(other: this): boolean {
    return (
      this.id === other.id
      || other
        .matchedBy()
        .every(b => this.matchedBy().some(a => a.id === b.id))
    )
  }

  setMatchedCache(cache: T[]) {
    this.matchedCache = cache
  }

  equals(other: Ingredient<T>): boolean {
    if (this.items.length !== other.items.length) return false
    return this.items.every(it => other.items.includes(it))
  }

  toString(options?: { names?: boolean }): string {
    return this.items
      .map(d =>
        options?.names ? (d as any).toString({ short: true }) : d.id
      )
      .join(' | ')
  }
}
