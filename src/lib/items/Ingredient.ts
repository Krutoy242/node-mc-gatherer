import Definition from './Definition'
import Stack from './Stack'

export default class Ingredient {
  static fromString(
    str: string,
    getById: (id: string) => Definition
  ): Ingredient {
    if (str === '') throw new Error('Ingredient cannot be empty')
    const items = str.split('|').map((s) => getById(s))
    return new Ingredient(items)
  }

  constructor(public readonly items: Definition[]) {
    if (items.length === 0)
      throw new Error('Ingredient must content at least 1 Definition')

    if (items.length > 2000) {
      throw new Error('Ingredient list probably too large')
    }
  }

  equals(other: Ingredient): boolean {
    if (this.items.length !== other.items.length) return false
    return this.items.every((it) => other.items.includes(it))
  }

  stack(amount?: number): Stack {
    return new Stack(this, amount)
  }

  toString(): string {
    return this.items.map((d) => d.id).join('|')
  }
}
