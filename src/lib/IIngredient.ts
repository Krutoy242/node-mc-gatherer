import PrimalStoreHelper from './PrimalStoreHelper'
import { IndexedRawAdditionals } from './types'
import { cleanupNbt, objToString } from './utils'

export function serializeNameMeta(ctName: string) {
  const match = ctName.split(':')
  const haveMeta = match.length > 2
  if (!haveMeta)
    if (['ore'].includes(match[0])) return match[1]
    else if (['fluid', 'liquid'].includes(match[0])) return ctName
    else return ctName + ':0'
  else if (ctName.slice(-1) === '*') return ctName.slice(0, -1) + '0'

  return ctName
}

export function serializeNbt(nbt?: string | object) {
  if (!nbt) return ''
  if (typeof nbt === 'object') return objToString(nbt)
  return nbt
    .replace(/ as \w+/g, '')
    .replace(/, /g, ',')
    .replace(/: */g, ':')
}

const clearableTags = [
  /\{"RSControl":\d+,"Facing":\d+,"Energy":\d+,"SideCache":\[\d+,\d+,\d+,\d+,\d+,\d+\],"Level":0\}/,
]

export function clearableTag(tag: unknown) {
  return clearableTags.some((rgx) => rgx.test(JSON.stringify(tag)))
}

export class IIngredient {
  private storeHelper: PrimalStoreHelper
  private name: string
  public count = 1
  public _weight = 1.0
  public tag?: unknown
  public futile?: boolean
  public strId?: string
  public additionals!: IndexedRawAdditionals

  constructor(storeHelper: PrimalStoreHelper, name: string) {
    this.storeHelper = storeHelper
    this.name = name
    this.update()
  }

  private copy(): IIngredient {
    const n = new IIngredient(this.storeHelper, this.name)
    n.count = this.count
    n.tag = this.tag
    return n
  }

  withTag(tag: any): IIngredient {
    if (!tag || Object.keys(tag).length === 0 || clearableTag(tag)) return this

    const n = this.copy()
    n.tag = tag
    n.update()
    return n
  }

  quantity() {
    return this.count * this._weight
  }

  weight(n: number) {
    if (isNaN(n)) return this
    this._weight = n || 1
    return this
  }

  amount(newAmount: number) {
    if (isNaN(newAmount) || this.count === newAmount) return this
    const n = this.copy()
    n.count = newAmount
    n.update()
    return n
  }

  asString() {
    return serializeNameMeta(this.name) + serializeNbt(cleanupNbt(this.tag))
  }
  update() {
    // Blacklist recipes that content this items
    // as inputs or outputs
    if (
      this.tag &&
      (this.tag as any).ncRadiationResistance /*  ||
          /^conarm:(helmet|chestplate|leggins|boots)$/.test(this.name) */
    ) {
      this.futile = true
      return
    }

    this.strId = this.asString()
    this.additionals = this.storeHelper.setField(this.strId)
  }

  or() {
    return this
  }
}
