import _ from 'lodash'

import PrimalStoreHelper from './additionalsStore'
import { IndexedRawAdditionals, RawCollection } from './types'
import { cleanupNbt, objToString } from './utils'

/*=============================================
=           Recipes
=============================================*/
const clearableTags = [
  /\{"RSControl":\d+,"Facing":\d+,"Energy":\d+,"SideCache":\[\d+,\d+,\d+,\d+,\d+,\d+\],"Level":0\}/,
]

function clearableTag(tag: unknown) {
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

type AnyIngredients = IIngredient | string | undefined | AnyIngredients[]
class IngredientList {
  main: IIngredient
  list: Array<IIngredient>
  keys: RawCollection
  futile: boolean
  count: number

  constructor(storeHelper: PrimalStoreHelper, arg: AnyIngredients) {
    this.list = _.flattenDeep([arg])
      .map((g) =>
        g && typeof g === 'string' ? new IIngredient(storeHelper, g) : g
      )
      .filter((i): i is IIngredient => i != null && !(i as IIngredient).futile)

    this.futile = !this.list.length

    this.keys = this.list.reduce((acc, i) => {
      const index = i.additionals.index
      acc[index] = (acc[index] || 0) + i.quantity()
      if (!acc[index]) throw new Error('No such index: ' + index)
      return acc
    }, {} as RawCollection)

    this.main = this.list[0]
    this.count = Object.keys(this.keys).length
  }

  toObj() {
    return this.count > 0 ? this.keys : undefined
  }
}

type RecipeParams = [
  outputs: AnyIngredients,
  inputs?: AnyIngredients,
  catalysts?: AnyIngredients
]

function serializeNameMeta(ctName: string) {
  const match = ctName.split(':')
  const haveMeta = match.length > 2
  if (!haveMeta)
    if (['ore'].includes(match[0])) return match[1]
    else if (['fluid', 'liquid'].includes(match[0])) return ctName
    else return ctName + ':0'
  else if (ctName.slice(-1) === '*') return ctName.slice(0, -1) + '0'

  return ctName
}

function serializeNbt(nbt?: string | object) {
  if (!nbt) return ''
  if (typeof nbt === 'object') return objToString(nbt)
  return nbt
    .replace(/ as \w+/g, '')
    .replace(/, /g, ',')
    .replace(/: */g, ':')
}

export default class PrimalRecipesHelper extends PrimalStoreHelper {
  constructor(tooltipMap: any) {
    super(tooltipMap)
  }

  BH(str: string) {
    return new IIngredient(this, str)
  }

  addRecipe(...params: RecipeParams): boolean {
    const [outputs, inputs, catalysts] = params.map(
      (o) => new IngredientList(this, o)
    )

    if (outputs.futile) return false
    if (inputs.futile && (!catalysts || catalysts.futile)) return false

    const ads = outputs.main.additionals
    ads.recipes ||= []
    ads.recipes.push({
      out:
        outputs.count > 1
          ? outputs.keys
          : outputs.main.quantity() !== 1
          ? outputs.main.quantity()
          : undefined,
      ins: inputs.toObj(),
      ctl: catalysts?.toObj(),
    })
    ;[...inputs.list, ...outputs.list].forEach((inp) => inp.additionals.used++)

    return true
  }
}
