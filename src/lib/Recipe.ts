import Calculable from './Calculable'
import Stack from './Stack'

export default class Recipe implements Calculable {
  complexity = 1000000.0
  cost = 1000000.0
  processing = 0.0
  purity = 0.0

  constructor(
    /** Recipe source (category name) */
    private source: string,
    public outputs: Stack[],
    public inputs?: Stack[],
    public catalysts?: Stack[]
  ) {}

  export() {
    return {
      source: this.source,
      outputs: this.outputs.map((o) => o.export()),
      inputs: this.inputs?.length
        ? this.inputs?.map((o) => o.export())
        : undefined,
      catalysts: this.catalysts?.length
        ? this.catalysts.map((o) => o.export())
        : undefined,
    }
  }

  toString() {
    return (
      `  [${this.source}]` +
      (!this.inputs?.length
        ? ''
        : '\n  ⮮ ' + this.inputs?.map((o) => o.toString())) +
      (!this.catalysts?.length
        ? ''
        : '\n  ▒ ' + this.catalysts?.map((o) => o.toString())) +
      `\n  ⮩ ${this.outputs.map((o) => o.toString())}`
    )
  }
}
