import Calculable from '../calc/Calculable'

import Stack from './Stack'

export default class Definition implements Calculable {
  static actualMeta(meta?: string): string | undefined {
    return meta === undefined
      ? undefined
      : // eslint-disable-next-line eqeqeq
      meta == '32767' || meta == '*'
      ? '0'
      : meta
  }

  static baseToId(
    source: string,
    entry: string,
    meta?: string,
    sNbt?: string
  ): string {
    const actualMeta = Definition.actualMeta(meta)
    return `${source}:${entry}${
      actualMeta !== undefined ? ':' + actualMeta : ''
    }${sNbt ? ':' + sNbt : ''}`
  }

  readonly id: string

  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0

  viewBox?: string
  display?: string

  /**
   * Recipes that has this item as output
   */
  recipes?: Set<number>

  /**
   * Recipes that depends on this item
   */
  dependencies?: Set<number>

  // constructor(
  //   /** Full ID source:entry:meta(:{nbt})? */
  //   public readonly id: string
  // ) {}

  constructor(
    public readonly source: string,
    public readonly entry: string,
    public readonly meta?: string,
    public readonly sNbt?: string
  ) {
    this.id = Definition.baseToId(source, entry, meta, sNbt)
  }

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
