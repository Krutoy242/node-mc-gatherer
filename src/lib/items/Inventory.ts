import Definition from './Definition'
import { MicroStack } from './Stack'

export default class Inventory {
  cost = 0.0
  private list = new Map<Definition, number>()

  constructor(private treshold: number) {}

  merge(arr: MicroStack[]) {
    if (this.outOfTreshold()) return
    arr.forEach((ms) => this.mergeSingle(ms.def, ms.amount))
  }

  mergeList(microStacks: MicroStack[]) {
    if (this.outOfTreshold()) return
    microStacks.forEach((ms) => {
      ms.def.mainRecipe?.catalList?.list.forEach((amount, def) =>
        this.mergeSingle(def, amount)
      )
    })
  }

  private outOfTreshold() {
    return this.cost >= this.treshold
  }

  private mergeSingle(def: Definition, amount?: number) {
    if (this.outOfTreshold()) return
    const oldAmount = this.list.get(def)
    const newAmount = amount ?? 1
    if (oldAmount !== undefined && oldAmount >= newAmount) return
    this.list.set(def, newAmount)
    const added = newAmount - (oldAmount ?? 0)
    this.cost += added * def.cost
  }
}
