import _ from 'lodash'

import { createFileLogger } from '../../log/logger'
import DefinitionStore from '../items/DefinitionStore'
import Ingredient from '../items/Ingredient'
import Stack from '../items/Stack'

import Recipe from './Recipe'

const noReqLog = createFileLogger('noRequirmentRecipe.log')

type AnyIngredient = Stack | string
type AnyIngredients = AnyIngredient | AnyIngredient[] | undefined

type RecipeParams = [
  outputs: AnyIngredients,
  inputs?: AnyIngredients,
  catalysts?: AnyIngredients
]

type RecipeLists = [outputs: Stack[], inputs?: Stack[], catalysts?: Stack[]]

export default class RecipeStore {
  store: Recipe[] = []

  constructor(public definitionStore: DefinitionStore) {}

  size() {
    return this.store.length
  }

  export() {
    return this.store.map((r) => r.export())
  }

  addRecipe(categoryName: string, ...params: RecipeParams): Recipe | undefined {
    const [outputs, inputs, catalysts] = params.map((p) =>
      this.parseRecipeParams(p)
    )

    if (!outputs.length) return
    if (!inputs.length && !catalysts?.length) {
      noReqLog(categoryName, ...outputs.map((o) => o.toString()), '\n')
      return
    }

    const recipeLists = this.uniformCatalysts(outputs, inputs, catalysts)
    const rec = new Recipe(this.store.length, categoryName, ...recipeLists)
    this.store.push(rec)

    return rec
  }

  uniformCatalysts(...args: RecipeLists): RecipeLists {
    if (args[1]?.length === 0) return args

    const outputs = args[0].slice(0)
    const inputs = args[1]?.slice(0) ?? []
    const catalList = args[2]?.slice(0) ?? []
    let hadChanges = false
    for (let out_i = outputs.length - 1; out_i >= 0; out_i--) {
      const out = outputs[out_i]
      const index = inputs.findIndex(
        (s) => s.ingredient.id === out.ingredient.id
      )

      if (index === -1) continue // No intersection
      const inp = inputs[index]

      const out_amount = out.amount ?? 1
      const inp_amount = inp.amount ?? 1
      if (out_amount < inp_amount) continue // Non-benefit

      if (out_amount > inp_amount) {
        outputs[out_i] = out.withAmount(out_amount - inp_amount)
      } else {
        // amounts equals
        outputs.splice(out_i, 1)
      }
      inputs.splice(index, 1)
      catalList.push(inp)

      hadChanges = true
    }

    if (!hadChanges || outputs.length === 0) return args

    return [outputs, inputs, catalList]
  }

  private anyRecipeParam(anyIngrs: AnyIngredient): Stack {
    return typeof anyIngrs === 'string'
      ? Stack.fromString(anyIngrs, this.definitionStore.getById)
      : anyIngrs
  }

  private parseRecipeParams(anyIngrs: AnyIngredients): Stack[] {
    if (!anyIngrs) return []
    const map: Stack[] = []
    const add = (a: AnyIngredient): any => {
      const stack = this.anyRecipeParam(a)
      const index = map.findIndex((s) => s.ingredient.equals(stack.ingredient))
      if (index === -1) return map.push(stack)
      map[index] = map[index].withAmount(
        (map[index].amount ?? 1) + (stack.amount ?? 1)
      )
    }
    if (Array.isArray(anyIngrs)) anyIngrs.forEach(add)
    else add(anyIngrs)

    return map
  }
}
