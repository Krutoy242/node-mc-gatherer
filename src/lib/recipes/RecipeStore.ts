import { createFileLogger } from '../../log/logger'
import Calculator from '../calc/Calculator'
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
    const index = this.store.push(recipe) - 1

    outputs.forEach((stack) => {
      stack.ingredient.items.forEach((def) =>
        (def.recipes ??= new Set()).add(index)
      )
    })

    recipe.requirments.forEach((stack) =>
      stack.ingredient.items.forEach((def) =>
        (def.dependencies ??= new Set()).add(index)
      )
    )

    return true
  }

  calculate() {
    return new Calculator(this.definitionStore, this.store).compute()
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
