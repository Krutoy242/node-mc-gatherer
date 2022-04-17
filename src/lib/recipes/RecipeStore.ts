import { createFileLogger } from '../../log/logger'
import DefinitionStore from '../items/DefinitionStore'
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
      this.anyRecipeParamToList(p)
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
      ? Stack.fromString(anyIngrs, (s) => this.definitionStore.getById(s))
      : anyIngrs
  }

  private anyRecipeParamToList(anyIngrs: AnyIngredients): Stack[] {
    if (!anyIngrs) return []
    if (Array.isArray(anyIngrs))
      return anyIngrs.map((p) => this.anyRecipeParam(p))
    return [this.anyRecipeParam(anyIngrs)]
  }
}
