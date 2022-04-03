import { Definition } from './DefinitionStore'

export type StackDef = Definition & {
  amount: number
}

/**
 * Stack is item that have amount
 */
export default class Stack {
  constructor(public definition: Definition, public amount = 1) {}

  withAmount(newAmount: number) {
    if (isNaN(newAmount) || this.amount === newAmount) return this
    return new Stack(this.definition, newAmount)
  }

  export() {
    return `${this.amount}x ${this.definition.id}`
  }
}
