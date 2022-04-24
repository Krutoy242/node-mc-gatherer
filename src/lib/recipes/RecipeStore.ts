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

export default class RecipeStore {
  store: Recipe[] = []

  constructor(public definitionStore: DefinitionStore) {}

  size() {
    return this.store.length
  }

  export() {
    return this.store.map((r) => r.export())
  }

  forCategory(categoryName: string) {
    return (...params: RecipeParams) => this.addRecipe(categoryName, ...params)
  }

  addRecipe(categoryName: string, ...params: RecipeParams): boolean {
    const [outputs, inputs, catalysts] = params.map((p) =>
      this.parseRecipeParams(p)
    )

    if (!outputs.length) return false
    if (!inputs.length && !catalysts?.length) {
      noReqLog(categoryName, ...outputs.map((o) => o.toString()), '\n')
      return false
    }

    const recipe = new Recipe(categoryName, outputs, inputs, catalysts)
    recipe.index = this.store.push(recipe) - 1

    return true
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
