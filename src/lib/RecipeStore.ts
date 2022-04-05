import { createFileLogger } from '../log/logger'

import DefinitionStore from './DefinitionStore'
import Recipe from './Recipe'
import Stack from './Stack'

const noReqLog = createFileLogger('noRequirmentRecipe.log')

type AnyIngredient = Stack | string
type AnyIngredients = AnyIngredient | AnyIngredient[] | undefined

type RecipeParams = [
  outputs: AnyIngredients,
  inputs?: AnyIngredients,
  catalysts?: AnyIngredients
]

export default class RecipeStore {
  private recipeStore: Recipe[] = []

  constructor(public definitionStore: DefinitionStore) {}

  BH(str: string, amount?: number) {
    return new Stack(this.definitionStore.get(str), amount)
  }

  export() {
    return this.recipeStore.map((r) => r.export())
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

    const recipe = new Recipe(outputs, inputs, catalysts)
    const index = this.recipeStore.push(recipe)
    outputs.forEach((out) => (out.definition.recipes ??= new Set()).add(index))

    return true
  }

  private anyRecipeParam(anyIngrs: AnyIngredient): Stack {
    return typeof anyIngrs === 'string'
      ? new Stack(this.definitionStore.get(anyIngrs))
      : anyIngrs
  }

  private anyRecipeParamToList(anyIngrs: AnyIngredients): Stack[] {
    if (!anyIngrs) return []
    if (typeof anyIngrs === 'string')
      return [new Stack(this.definitionStore.get(anyIngrs))]
    if (Array.isArray(anyIngrs))
      return anyIngrs.map((p) => this.anyRecipeParam(p))
    return [anyIngrs]
  }
}
