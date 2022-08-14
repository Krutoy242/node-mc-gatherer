export class Stock<T = unknown> {
  private store = new Map<T, number>()

  add(otherStock: Stock<T>): this
  add(key: T, v?: number): this
  add(arg0: Stock<T> | T, v?: number): this {
    if (arg0 instanceof Stock) arg0.store.forEach((amount, def) => this.add(def, amount))
    else this.store.set(arg0, this.get(arg0) + (v ?? 1))
    return this
  }

  maxed(otherStock: Stock<T>): this
  maxed(key: T, v?: number): this
  maxed(arg0: Stock<T> | T, v?: number): this {
    if (arg0 instanceof Stock) arg0.store.forEach((amount, def) => this.maxed(def, amount))
    else this.store.set(arg0, Math.max(this.get(arg0), v ?? 1))
    return this
  }

  get(key: T): number {
    return this.store.get(key) ?? 0
  }

  toArray(): [item: T, amount: number][] {
    return [...this.store]
  }
}
