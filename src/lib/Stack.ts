import Definition from './Definition'

export type StackDef = Definition & {
  amount: number
}

/**
 * Stack is item that have amount
 */
export default class Stack {
  public constructor(
    public definition: Definition,
    public readonly amount = 1
  ) {
    if (amount === 0) {
      throw new Error(
        'Stack Amount could not be zero. Stack: ' + this.definition.id
      )
    }
  }

  public withAmount(newAmount: number) {
    if (isNaN(newAmount) || this.amount === newAmount) return this
    return new Stack(this.definition, newAmount)
  }

  toString() {
    return `${this.amount}x ${this.definition.id}`
  }

  public export() {
    return this.toString()
  }
}
