import numeral from 'numeral'

import { CsvRecipe } from '../../api'
import { DefIngrStack } from '../../types'
import Setable from '../calc/Setable'
import Definition from '../items/Definition'
import { DefinitionStack } from '../items/DefinitionStack'
import Inventory from '../items/Inventory'

const numFormat = (n: number) => numeral(n).format('0,0.00')

export default class Recipe extends Setable {
  inventory?: Inventory

  readonly requirments: DefIngrStack[]

  constructor(
    public readonly index: number,
    /** Category name */
    private source: string,
    public readonly outputs: DefIngrStack[],
    public readonly inputs?: DefIngrStack[],
    public readonly catalysts?: DefIngrStack[]
  ) {
    super()
    this.requirments = [...(inputs ?? []), ...(catalysts ?? [])]
  }

  export(): CsvRecipe {
    return {
      index: this.index,
      source: this.source,
      complexity: this.complexity,
      outputs: this.outputs.map(String),
      inputs: this.inputs?.length ? this.inputs?.map(String) : undefined,
      catalysts: this.catalysts?.length
        ? this.catalysts.map(String)
        : undefined,
    }
  }

  /**
   * Calculate recipe
   * @returns `true` if new value calculated, `false` if not changed or unable to
   */
  calculate(): boolean {
    const [catPurity, catDefs] = this.getBestDefs(this.catalysts)
    if (catPurity <= 0) return false

    const [inPurity, inDefs] = this.getBestDefs(this.inputs)
    if (inPurity <= 0) return false

    const purity = catPurity * inPurity
    if (this.purity > purity) return false

    const samePurity = this.purity === purity
    const cost = inDefs.reduce((a, b) => a + (b.amount ?? 1) * b.it.cost, 1.0)
    if (samePurity && this.complexity <= cost) return false

    let catalList: Inventory | undefined
    if (catDefs.length || inDefs.some((d) => d.it.mainRecipe?.inventory)) {
      const maxCost = samePurity ? this.complexity - cost : Infinity
      catalList = new Inventory(maxCost, this)
        .addCatalysts(catDefs)
        .addCatalystsOf(catDefs)
        .addCatalystsOf(inDefs)
      if (catalList.isFutile()) return false
    }
    const processing = catalList?.processing ?? 0

    const complexity = cost + processing
    if (this.complexity === complexity) return false
    if (samePurity && this.complexity < complexity) return false

    // Unsignificant difference, probably loop
    const diffFactor = (this.complexity - complexity) / complexity
    if (samePurity && diffFactor < 0.0001) return false

    this.set({ purity, cost, processing })
    this.inventory = catalList

    return true
  }

  override toString(options?: { short?: boolean; detailed?: boolean }) {
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

  commandString(options?: { noSource?: boolean }) {
    const arr = (['outputs', 'inputs', 'catalysts'] as const)
      .map((k) => this.listToArr(k, "''"))
      .map((s) => (!s ? undefined : s.length > 1 ? `[${s.join(', ')}]` : s))
    if (!arr[2]) arr.splice(2, 1)
    if (!arr[1]) arr[1] = "''"
    return `addRecipe(${
      options?.noSource ? '' : `"${this.source}", `
    }${arr.join(', ')})`
  }

  private getBestDefs(
    stacks?: DefIngrStack[]
  ): [purity: number, defs: DefinitionStack[]] {
    if (!stacks) return [1.0, []]
    let purity = 1.0
    const defs: DefinitionStack[] = []
    for (const stack of stacks) {
      let minComp = Infinity
      let maxPur = 0.0
      let bestDef!: Definition
      for (const def of stack.it.matchedBy()) {
        if (
          def.purity > maxPur ||
          (def.purity === maxPur && def.complexity < minComp)
        ) {
          bestDef = def as Definition
          maxPur = def.purity
          minComp = def.complexity
        }
      }
      if (maxPur === 0) return [0, []]
      purity *= maxPur
      defs.push(new DefinitionStack(bestDef, stack.amount))
    }
    return [purity, defs]
  }

  private listToArr(
    listName: 'outputs' | 'inputs' | 'catalysts',
    parenth?: string
  ): string[] | undefined {
    if (!this[listName]?.length) return undefined
    const p = [...(parenth ?? '')].map((c) => c ?? '')
    const stackToStr = (o: DefIngrStack) => {
      let s = o.toString()
      if (p[0] === '"') s = s.replace(/"/g, '\\"')
      if (p[0] === "'") s = s.replace(/'/g, "\\'")
      return (p[0] ?? '') + s + (p[1] ?? '')
    }
    return this[listName]?.map(stackToStr)
  }

  private listToString(
    prefix: string,
    listName: 'outputs' | 'inputs' | 'catalysts',
    parenth?: string
  ): string {
    if (!this[listName]?.length) return ''
    return prefix + this.listToArr(listName, parenth)?.join(', ') ?? ''
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
