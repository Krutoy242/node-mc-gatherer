import Definition from './Definition'
import Ingredient from './Ingredient'

/**
 * Stack is item that have amount
 */
export default class Stack {
  static fromString(str: string, getFromId: (id: string) => Definition): Stack {
    if (str === undefined || str === '')
      throw new Error('Stack cannot be empty')

    const g = str.match(/^((?<amount>[^ ]+)x )?(?<id>.+)$/)?.groups
    if (!g) throw new Error(`Cant parse stack for: ${str}`)

    const amount = g.amount === undefined ? 1 : Number(g.amount)
    if (amount !== undefined && isNaN(amount))
      throw new Error(`Wrong amount for Stack string: ${str}`)

    return new Stack(
      Ingredient.fromString(g.id, getFromId),
      g.amount ? amount : 1
    )
  }

  ingredient: Ingredient

  constructor(
    ingredient: Ingredient | Definition,

    /** Amount could be undefined - means "any amount" */
    public readonly amount?: number
  ) {
    if (amount !== undefined && isNaN(amount))
      throw new Error('Stack amount cannot be NaN')

    this.ingredient =
      ingredient instanceof Definition
        ? Ingredient.fromDefs([ingredient])
        : ingredient
  }

  withAmount(newAmount?: number) {
    if (this.amount === newAmount) return this
    return new Stack(this.ingredient, newAmount)
  }

  toString() {
    const amount = this.amount === undefined ? '?' : this.amount
    return `${amount}x ${this.ingredient.toString()}`
  }

  export() {
    return this.toString()
  }
}

export interface MicroStack {
  amount?: number
  def: Definition
}
