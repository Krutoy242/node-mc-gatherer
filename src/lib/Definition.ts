import { ITypes } from '../from/JEIExporterTypes'

import Calculable from './Calculable'

export default class Definition implements Calculable {
  complexity = 1000000.0
  cost = 1000000.0
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
    public readonly iType: ITypes
  ) {}

  toString() {
    return `${getPurity(this.purity)}${this.complexity} "${this.display}" ${
      this.id
    }`
  }
}

function getPurity(n: number): string {
  return `▕${
    n === 0 ? ' ' : n === 1 ? '█' : '▇▆▅▄▃▂▁'[Math.min(6, -Math.log10(n) | 0)]
  }▏`
}
