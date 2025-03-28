import type { CsvRecipe, Labeled, SolvableRecipe } from '../../api'

import type { DefIngrStack } from '../../types'
import type Definition from '../items/Definition'
import numeral from 'numeral'
import Setable from '../calc/Setable'
import { DefinitionStack } from '../items/DefinitionStack'
import Inventory from '../items/Inventory'

const numFormat = (n: number) => numeral(n).format('0,0.00')

export default class Recipe extends Setable implements SolvableRecipe<Definition>, Labeled {
  inventory?: Inventory

  /** Both Catalysts and inputs */
  readonly requirments: DefIngrStack[]

  constructor(
    public readonly index: number,
    /** Category name */
    private source: string,
    public readonly outputs: DefIngrStack[],
    public readonly inputs?: DefIngrStack[],
    public readonly catalysts?: DefIngrStack[],
  ) {
    super()
    this.requirments = [...(inputs ?? []), ...(catalysts ?? [])]
  }

  labels = ''

  export(): CsvRecipe {
    return {
      index: this.index,
      source: this.source,
      labels: this.labels !== '' ? this.labels : undefined,
      complexity: this.complexity,
      purity: this.purity,
      cost: this.cost,
      processing: this.processing,
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
  calculate() {
    const [catPurity, catDefs] = this.getCheapestDefs(this.catalysts)
    if (catPurity <= 0)
      return

    const [inPurity, inDefs] = this.getCheapestDefs(this.inputs)
    if (inPurity <= 0)
      return

    const purity = catPurity * inPurity
    if (this.purity > purity)
      return

    const samePurity = this.purity === purity
    const cost = inDefs.reduce((a, b) => a + (b.amount ?? 1) * b.it.cost, 1.0)
    if (samePurity && this.complexity <= cost)
      return // Old recipe better

    let catalList: Inventory | undefined
    if (catDefs.length || inDefs.some(d => d.it.bestRecipe()?.[0]?.inventory)) {
      const treshold = samePurity ? this.complexity - cost : Number.POSITIVE_INFINITY
      catalList = new Inventory(treshold, this)
        .addCatalysts(catDefs)
        .addCatalystsOf(inDefs)
      if (catalList.futile)
        return
    }
    const processing = catalList?.processing ?? 0

    const complexity = cost + processing
    if (this.complexity === complexity)
      return
    if (samePurity && this.complexity < complexity)
      return

    // Unsignificant difference, probably loop
    const diffFactor = (this.complexity - complexity) / complexity
    if (samePurity && diffFactor < 0.00000000001)
      return

    this.set({ purity, cost, processing })
    this.inventory = catalList

    return true
  }

  override toString(options?: { short?: boolean, detailed?: boolean }) {
    const recID = `[${this.source}] #${this.index}`
    if (options?.short)
      return ` ${recID} ${this.listToString('', 'outputs')}`
    const detailed = !options?.detailed ? '' : this.toStringDetailed()
    return (
      `${recID}${
        detailed
      }${this.listToString('\n↱ ', 'outputs')
      }${this.listToString('\n░ ', 'catalysts')
      }${this.listToString('\n⮬ ', 'inputs')}`
    )
  }

  commandString(options?: { noSource?: boolean }) {
    const arr = (['outputs', 'inputs', 'catalysts'] as const)
      .map(k => this.listToArr(k, '\'\''))
      .map(s => (!s ? undefined : s.length > 1 ? `[${s.join(', ')}]` : s))
    if (!arr[2])
      arr.splice(2, 1)
    if (!arr[1])
      arr[1] = '\'\''
    return `addRecipe(${
      options?.noSource ? '' : `"${this.source}", `
    }${arr.join(', ')})`
  }

  private getCheapestDefs(
    stacks?: DefIngrStack[],
  ): [purity: number, defs: DefinitionStack[]] {
    if (!stacks)
      return [1.0, []]
    let purity = 1.0
    const defs: DefinitionStack[] = []
    for (const stack of stacks) {
      let minComp = Number.POSITIVE_INFINITY
      let maxPur = 0.0
      let bestDef!: Definition
      for (const def of stack.it.matchedBy()) {
        if (def.purity < maxPur || def.complexity >= minComp)
          continue
        bestDef = def
        maxPur = def.purity
        minComp = def.complexity
      }
      if (maxPur === 0)
        return [0, []]
      purity *= maxPur
      defs.push(new DefinitionStack(bestDef, stack.amount))
    }
    return [purity, defs]
  }

  private listToArr(
    listName: 'outputs' | 'inputs' | 'catalysts',
    parenth?: string,
  ): string[] | undefined {
    if (!this[listName]?.length)
      return undefined
    const p = [...(parenth ?? '')].map(c => c ?? '')
    const stackToStr = (o: DefIngrStack) => {
      let s = o.toString()
      if (p[0] === '"')
        s = s.replace(/"/g, '\\"')
      if (p[0] === '\'')
        s = s.replace(/'/g, '\\\'')
      return (p[0] ?? '') + s + (p[1] ?? '')
    }
    return this[listName]?.map(stackToStr)
  }

  private listToString(
    prefix: string,
    listName: 'outputs' | 'inputs' | 'catalysts',
    parenth?: string,
  ): string {
    if (!this[listName]?.length)
      return ''
    return prefix + (this.listToArr(listName, parenth)?.join(', ') ?? '')
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
