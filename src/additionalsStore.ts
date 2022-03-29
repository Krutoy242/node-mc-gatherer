/*=============================================
=           Additionals Store
=============================================*/

import { IndexedRawAdditionals, IndexedRawAdditionalsStore, RawAdditionalsStore } from './types'

type AdditID = string | number
type ValueOf<T> = T[keyof T]

export default class PrimalStoreHelper {
  private store: IndexedRawAdditionalsStore = {}
  private additionalsLength = 0

  constructor() {}

  get(definition: string) {
    return this.store[definition]
  }

  setField(id: AdditID, field?: keyof IndexedRawAdditionals, value?: ValueOf<IndexedRawAdditionals>) {
    const found = isNaN(Number(id)) ? this.store[id] : Object.values(this.store)[id as number]

    let picked = found
    if (!picked) {
      picked = {
        index: this.additionalsLength++,
      }
      this.store[id] = picked
    }

    if (field) (picked[field] as any) ||= value

    return picked
  }

  exportAdditionals(): RawAdditionalsStore {
    for (const key in this.store) {
      delete (this.store[key] as any).index
    }
    return this.store
  }
}
