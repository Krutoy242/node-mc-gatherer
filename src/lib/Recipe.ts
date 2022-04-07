import Calculable from './Calculable'
import Stack from './Stack'

export default class Recipe implements Calculable {
  complexity = 0.0
  cost = 0.0
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
      this.listToString('\n  ⮮ ', 'inputs') +
      this.listToString('\n  ☐ ', 'catalysts') +
      this.listToString('\n  ⮩ ', 'outputs')
    )
  }

  listToString(
    prefix: string,
    listName: 'outputs' | 'inputs' | 'catalysts'
  ): string {
    return !this[listName]?.length
      ? ''
      : prefix + (this[listName]?.map((o) => o.toString()).join(', ') ?? '')
  }
}
