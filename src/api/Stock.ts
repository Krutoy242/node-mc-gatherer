export class Stock<T = unknown> {
  private store = new Map<T, number>()

  add(key: T, v?: number): this {
    this.store.set(key, this.get(key) + (v ?? 1))
    return this
  }

  addAll(otherStock: Stock<T>): this {
    otherStock.store.forEach((amount, def) => this.add(def, amount))
    return this
  }

  maxed(key: T, v?: number): this {
    this.store.set(key, Math.max(this.get(key), v ?? 1))
    return this
  }

  maxedAll(otherStock: Stock<T>) {
    otherStock.store.forEach((amount, def) => this.maxed(def, amount))
    return this
  }

  get(key: T): number {
    return this.store.get(key) ?? 0
  }

  toArray(): [item: T, amount: number][] {
    return [...this.store]
  }
}
