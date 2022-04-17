import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'

import glob from 'glob'

import Stack from '../lib/items/Stack'
import RecipeStore from '../lib/recipes/RecipeStore'

export type AddRecipeFn = (
  recipe_source: string,
  outputs: string | string[],
  inputs?: string | string[],
  catalysts?: string | string[]
) => void

type DefaultCallback = (fn: AddRecipeFn) => void

export default async function applyCustoms(recipesStore: RecipeStore) {
  const modules = await Promise.all(
    glob
      .sync(resolve(__dirname, './recipes/**/*.ts'))
      .map((filePath) => import(filePath))
  )

  modules.forEach((modModule) => {
    const fn = modModule.default as DefaultCallback
    fn((recipe_source, outputs, inputs, catalysts) =>
      recipesStore.addRecipe(
        recipe_source,
        shortToStack(outputs),
        shortToStack(inputs),
        shortToStack(catalysts)
      )
    )
  })

  function shortToStack(short?: string[] | string): Stack[] | undefined {
    if (!short) return
    return [short]
      .flat()
      .map((str) => Stack.fromString(str, recipesStore.definitionStore.getById))
  }
}
