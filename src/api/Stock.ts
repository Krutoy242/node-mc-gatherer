export default class Stock<T = unknown> {
  private store = new Map<T, number>()

  add(otherStock: Stock<T>): void
  add(key: T, v?: number): void
  add(arg0: Stock<T> | T, v?: number): void {
    if (arg0 instanceof Stock)
      return arg0.store.forEach((amount, def) => this.add(def, amount))
    this.store.set(arg0, (this.store.get(arg0) ?? 0) + (v ?? 1))
  }

  maxed(otherStock: Stock<T>): void
  maxed(key: T, v?: number): void
  maxed(arg0: Stock<T> | T, v?: number): void {
    if (arg0 instanceof Stock)
      return arg0.store.forEach((amount, def) => this.maxed(def, amount))
    this.store.set(arg0, Math.max(this.store.get(arg0) ?? 0, v ?? 1))
  }

  get(key: T): number {
    return this.store.get(key) ?? 0
  }

  toArray(): [key: T, v: number][] {
    return [...this.store]
  }
}
