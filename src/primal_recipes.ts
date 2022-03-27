import _ from 'lodash'
import { setField } from './additionalsStore'
import { IndexedRawAdditionals, RawCollection } from './types/raw'
import { cleanupNbt, objToString } from './utils'

/*=============================================
=           Recipes
=============================================*/
const clearableTags = [
  /\{"RSControl":\d+,"Facing":\d+,"Energy":\d+,"SideCache":\[\d+,\d+,\d+,\d+,\d+,\d+\],"Level":0\}/,
]
function clearableTag(tag: any) {
  return clearableTags.some((rgx) => rgx.test(JSON.stringify(tag)))
}
export class IIngredient {
  public name: string
  public count = 1
  public _weight = 1.0
  public tag?: any
  public futile?: boolean
  public strId?: string
  public additionals!: IndexedRawAdditionals

  constructor(str: string) {
    this.name = str
    this.update()
  }

  private copy(): IIngredient {
    const n = new IIngredient(this.name)
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
      this.tag.ncRadiationResistance /*  ||
        /^conarm:(helmet|chestplate|leggins|boots)$/.test(this.name) */
    ) {
      this.futile = true
      return
    }

    this.strId = this.asString()
    this.additionals = setField(this.strId)
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

  constructor(arg: AnyIngredients) {
    this.list = _.flattenDeep([arg])
      .map((g) => (_.isString(g) ? BH(g) : g))
      .filter((i): i is IIngredient => i != null && !i.futile)

    this.futile = !this.list.length

    this.keys = this.list.reduce((acc, i) => {
      const index = i.additionals.index
      acc[index] = (acc[index] || 0) + i.quantity()
      if (!acc[index]) throw new Error()
      return acc
    }, {} as RawCollection)

    this.main = this.list[0]
    this.count = Object.keys(this.keys).length
  }

  toObj() {
    return this.count > 0 ? this.keys : undefined
  }
}

export function BH(str: string) {
  return new IIngredient(str)
}

// Init Crafting Table as first item
BH('minecraft:crafting_table')

type RecipeParams = [outputs: AnyIngredients, inputs?: AnyIngredients, catalysts?: AnyIngredients]

export function addRecipe(...params: RecipeParams) {
  const [outputs, inputs, catalysts] = params.map((o) => new IngredientList(o))

  if (outputs.futile) return
  if (inputs.futile && (!catalysts || catalysts.futile)) return

  const ads = outputs.main.additionals
  ads.recipes = ads.recipes || []
  ads.recipes.push({
    out: outputs.count > 1 ? outputs.keys : outputs.main.quantity() !== 1 ? outputs.main.quantity() : undefined,
    ins: inputs.toObj(),
    ctl: catalysts?.toObj(),
  })
}

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
