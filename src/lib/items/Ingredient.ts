import Definition from './Definition'
import Stack from './Stack'

export default class Ingredient {
  static fromString(
    str: string,
    getFrimId: (id: string) => Definition
  ): Ingredient {
    if (str === '') throw new Error('Ingredient cannot be empty')
    const items = str.split('|').map((s) => getFrimId(s))
    return new Ingredient(items)
  }

  items: Definition[]

  // constructor(serialized: string)
  constructor(items: Definition[]) {
    if (items.length === 0)
      throw new Error('Ingredient must content at least 1 Definition')

    this.items = items
    // this.items = items===undefined ? [] : typeof items === 'string' ?  :
  }

  stack(amount?: number): Stack {
    return new Stack(this, amount)
  }

  toString(): string {
    return this.items.map((d) => d.id).join('|')
  }
}
