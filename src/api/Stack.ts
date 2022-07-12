/**
 * Object with amount
 */
export default class Stack<T> {
  static fromString<U>(str: string, unserialize: (id: string) => U) {
    if (str === undefined || str === '')
      throw new Error('Stack cannot be empty')

    const g = str.match(/^((?<amount>[^ ]+)x )?(?<id>.+)$/)?.groups
    if (!g) throw new Error(`Cant parse stack for: ${str}`)

    const amount = g.amount === undefined ? 1 : Number(g.amount)

    return new Stack(unserialize(g.id), g.amount ? amount : 1)
  }

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
