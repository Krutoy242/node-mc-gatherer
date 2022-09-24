import { parse, resolve } from 'path'

import glob from 'glob'

import type RecipeStore from '../lib/recipes/RecipeStore'

type ModuleType = typeof import('./recipes/entities')

export type AddRecipeFn = (
  outputs: string | string[],
  inputs?: string | string[],
  catalysts?: string | string[]
) => void

export default async function applyCustoms(recipesStore: RecipeStore, modList?: Record<string, unknown>) {
  await applyList('./recipes/*.ts', false)
  await applyList('./recipes/mods/*.ts', true)

  async function applyList(globStr: string, useFilter: boolean) {
    let fileList = glob.sync(resolve(__dirname, globStr))
    if (useFilter && modList) fileList = fileList.filter(f => modList[parse(f).name])
    const modules = await Promise.all(
      fileList.map(filePath => import(filePath) as unknown as ModuleType)
    )

    modules.forEach((modModule, i) => {
      const source = parse(fileList[i]).name // Mod name or category
      modModule.default((outputs, inputs, catalysts) =>
        recipesStore.addRecipe(`custom:${source}`, outputs, inputs, catalysts)
      )
    })
  }
  return true
}

