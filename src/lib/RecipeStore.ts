import { createFileLogger } from '../log/logger'

import Calculator from './Calculator'
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
  private store: Recipe[] = []

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
    outputs.forEach((out) => {
      ;(out.definition.recipes ??= new Set()).add(index)
    })
    const requirments = [...(inputs ?? []), ...(catalysts ?? [])]
    requirments.forEach((stack) =>
      (stack.definition.dependencies ??= new Set()).add(index)
    )

    return true
  }

  calculate() {
    return new Calculator(this.definitionStore, this.store).compute()
  }

  private anyRecipeParam(anyIngrs: AnyIngredient): Stack {
    return typeof anyIngrs === 'string'
      ? this.definitionStore.getAuto(anyIngrs).stack()
      : anyIngrs
  }

  private anyRecipeParamToList(anyIngrs: AnyIngredients): Stack[] {
    if (!anyIngrs) return []
    if (typeof anyIngrs === 'string')
      return [this.definitionStore.getAuto(anyIngrs).stack()]
    if (Array.isArray(anyIngrs))
      return anyIngrs.map((p) => this.anyRecipeParam(p))
    return [anyIngrs]
  }
}
