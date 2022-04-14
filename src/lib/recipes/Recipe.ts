import Calculable from '../calc/Calculable'
import Stack from '../items/Stack'

export default class Recipe implements Calculable {
  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0

  readonly requirments: Stack[]

  constructor(
    /** Recipe source (category name) */
    private source: string,
    public outputs: Stack[],
    public inputs?: Stack[],
    public catalysts?: Stack[]
  ) {
    this.requirments = [...(inputs ?? []), ...(catalysts ?? [])]
  }

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
      this.listToString('\n  ↱ ', 'outputs') +
      this.listToString('\n  ░ ', 'catalysts') +
      this.listToString('\n  ⮬ ', 'inputs')
    )
  }

  private listToString(
    prefix: string,
    listName: 'outputs' | 'inputs' | 'catalysts'
  ): string {
    return !this[listName]?.length
      ? ''
      : prefix + (this[listName]?.map((o) => o.toString()).join(', ') ?? '')
  }
}
