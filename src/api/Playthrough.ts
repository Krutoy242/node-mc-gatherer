import Stack from './Stack'
import Stock from './Stock'

export default class Playthrough {
  private catalysts = new Stock()
  private usages = new Stock()

  addCatalysts(catalysts: Stack<unknown>[]) {
    catalysts.forEach((ms) => this.catalysts.maxed(ms.it, ms.amount))
  }

  addInputs(usages: Stack<unknown>[], multiplier: number) {
    usages.forEach((ms) =>
      this.usages.add(ms.it, (ms.amount ?? 1) * multiplier)
    )
  }
}
