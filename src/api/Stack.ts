/**
 * Object with amount
 */
export default class Stack<T> {
  constructor(
    public readonly it: T,

    /** Amount could be undefined - means "any amount" */
    public readonly amount?: number
  ) {
    if (amount !== undefined && isNaN(amount))
      throw new Error('Stack amount cannot be NaN')
  }

  toString() {
    const amount = this.amount === undefined ? '?' : this.amount
    return `${amount !== 1 ? amount + 'x ' : ''}${String(this.it)}`
  }

  withAmount(newAmount?: number) {
    if (this.amount === newAmount) return this
    return new Stack(this.it, newAmount)
  }
}
