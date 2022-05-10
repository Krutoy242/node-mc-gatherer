import _ from 'lodash'

import Definition from '../lib/items/Definition'
import { MicroStack } from '../lib/items/Stack'
import { escapeCsv } from '../lib/utils'

export default class Playthrough {
  private catalysts = new Stock<Definition>()
  private usages = new Stock<Definition>()

  addCatalysts(catalysts: MicroStack[]) {
    catalysts.forEach((ms) => this.catalysts.maxed(ms.def, ms.amount))
  }

  addInputs(usages: MicroStack[], multiplier: number) {
    usages.forEach((ms) =>
      this.usages.add(ms.def, (ms.amount ?? 1) * multiplier)
    )
  }

  toCSV(): string {
    const header = 'Usage,Popularity,Name,ID'
    const uniq = new Stock<Definition>()

    uniq.maxed(this.catalysts)
    uniq.add(this.usages)

    return (
      `${header}\n` +
      _.sortBy(uniq.toArray(), (o) => -o[1])
        .map(([def, v]) =>
          [
            v,
            this.catalysts.get(def),
            escapeCsv(def.display),
            escapeCsv(def.id),
          ].join(',')
        )
        .join('\n')
    )
  }
}

class Stock<T> {
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
