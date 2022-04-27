import numeral from 'numeral'

import Calculable from '../calc/Calculable'
import Inventory from '../items/Inventory'
import Stack from '../items/Stack'

const numFormat = (n: number) => numeral(n).format('0,0.00')

export default class Recipe implements Calculable {
  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0
  inventory?: Inventory

  readonly requirments: Stack[]

  constructor(
    public readonly index: number,
    /** Category name */
    private source: string,
    public readonly outputs: Stack[],
    public readonly inputs?: Stack[],
    public readonly catalysts?: Stack[]
  ) {
    this.requirments = [...(inputs ?? []), ...(catalysts ?? [])]
  }

  export() {
    return {
      index: this.index,
      source: this.source,
      complexity: this.complexity,
      outputs: this.outputs.map((o) => o.export()),
      inputs: this.inputs?.length
        ? this.inputs?.map((o) => o.export())
        : undefined,
      catalysts: this.catalysts?.length
        ? this.catalysts.map((o) => o.export())
        : undefined,
    }
  }

  toString(options?: { short?: boolean; detailed?: boolean }) {
    const recID = `[${this.source}] #${this.index}`
    if (options?.short) return ` ${recID} ${this.listToString('', 'outputs')}`
    const detailed = !options?.detailed ? '' : this.toStringDetailed()
    return (
      `${recID}` +
      detailed +
      this.listToString('\n↱ ', 'outputs') +
      this.listToString('\n░ ', 'catalysts') +
      this.listToString('\n⮬ ', 'inputs')
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

  private toStringDetailed(): string {
    const keys = ['purity', 'complexity', 'cost', 'processing'] as const

    const fieldsStr = `${keys.join('/')}: ${keys
      .map((k, i) => (i === 0 ? this[k] : numFormat(this[k])))
      .join(' / ')}`

    return `
${fieldsStr} steps: ${this.inventory?.steps}`
  }
}
