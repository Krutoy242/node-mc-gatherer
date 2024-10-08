import type { Identified } from '.'

import lodash from 'lodash'
import { Ingredient } from './Ingredient'

import Store from './Store'

const { uniqBy } = lodash

export class IngredientStore<T extends Identified> extends Store<
  Ingredient<T>
> {
  constructor(unserialize: (id: string) => T) {
    super((id: string) =>
      this.fromItems(id.split(/\s*\|\s*/).map(unserialize), id, true),
    )
  }

  fromItems(items: T[], id?: string, skipCache = false): Ingredient<T> {
    if (items.length === 0)
      throw new Error('Ingredient must content at least 1 item')

    const _items = uniqBy(
      items.length > 2000 ? [items[0]] : items,
      it => it.id,
    )
    const remakeID = _items.length !== items.length || !id
    const _id = remakeID ? Ingredient.itemsToID(_items) : id

    return this.fromStore(_items, _id, skipCache)
  }

  fromItem(item: T, id?: string, skipCache = false): Ingredient<T> {
    return this.fromStore([item], id ?? Ingredient.itemsToID([item]), skipCache)
  }

  private fromStore(items: T[], id: string, skipCache: boolean): Ingredient<T> {
    return (
      (!skipCache && this.getUnsafe(id))
      || this.set(id, new Ingredient(items, id))
    )
  }
}
