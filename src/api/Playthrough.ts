import { Stack } from './Stack'
import { Stock } from './Stock'

export default class Playthrough<T> {
  private readonly catalysts = new Stock<T>()
  private readonly usages = new Stock<T>()

  addCatalysts(catalysts: Stack<T>[]) {
    catalysts.forEach((ms) => this.catalysts.maxed(ms.it, ms.amount))
  }

  addInputs(usages: Stack<T>[], multiplier: number) {
    usages.forEach((ms) => {
      this.usages.add(ms.it, (ms.amount ?? 1) * multiplier)
    })
  }

  getMerged() {
    return new Stock<T>().maxed(this.catalysts).add(this.usages)
  }

  getCatalyst(obj: T) {
    return this.catalysts.get(obj)
  }
}
