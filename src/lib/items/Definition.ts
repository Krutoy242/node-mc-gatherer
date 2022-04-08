import { IType } from '../../from/jeie/IType'
import Calculable from '../calc/Calculable'

import Stack from './Stack'

export default class Definition implements Calculable {
  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0

  viewBox?: string
  display?: string
  recipes?: Set<number>

  /**
   * Recipes that depends on this item
   */
  dependencies?: Set<number>

  constructor(
    /** Full ID source:entry:meta(:{nbt})? */
    public readonly id: string,
    public readonly iType: IType
  ) {}

  toString() {
    return `${getPurity(this.purity)}${this.complexity} "${this.display}" ${
      this.id
    }`
  }

  stack(amount = 1): Stack {
    return new Stack(this, amount)
  }
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}
