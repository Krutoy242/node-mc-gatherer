import { Definition } from './DefinitionStore'

export type StackDef = Definition & {
  amount: number
}

/**
 * Stack is item that have amount
 */
export default class Stack {
  public constructor(public definition: Definition, public amount = 1) {}

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
