import _ from 'lodash'

import { IIngredient } from './IIngredient'
import PrimalStoreHelper from './PrimalStoreHelper'
import { RawCollection } from './types'

/*=============================================
=           Recipes
=============================================*/

type AnyIngredients = IIngredient | string | AnyIngredients[] | undefined
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

export default class PrimalRecipesHelper extends PrimalStoreHelper {
  constructor(tooltipMap: { [id: string]: string }) {
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
