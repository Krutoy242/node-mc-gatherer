import { parse, resolve } from 'path'

import glob from 'glob'

import type RecipeStore from '../lib/recipes/RecipeStore'

type ModuleType = typeof import('./recipes/entities')

export type AddRecipeFn = (
  outputs: string | string[],
  inputs?: string | string[],
  catalysts?: string | string[]
) => void

export default async function applyCustoms(recipesStore: RecipeStore) {
  const fileList = glob.sync(resolve(__dirname, './recipes/**/*.ts'))
  const modules = await Promise.all(
    fileList.map(filePath => import(filePath) as unknown as ModuleType)
  )

  modules.forEach((modModule, i) => {
    const fn = modModule.default
    fn((outputs, inputs, catalysts) =>
      recipesStore.addRecipe(
        `custom:${parse(fileList[i]).name}`,
        outputs,
        inputs,
        catalysts
      )
    )
  })
  return true
}
