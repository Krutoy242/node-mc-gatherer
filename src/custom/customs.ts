import { dirname, parse, resolve } from 'node:path'

import { fileURLToPath, pathToFileURL } from 'node:url'
import { globSync } from 'glob'

import type RecipeStore from '../lib/recipes/RecipeStore'

// Convert the URL to a file path and get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
    const fullPath = resolve(__dirname, globStr).replace(/\\/g, '/')
    let fileList = globSync(fullPath)
    if (useFilter && modList)
      fileList = fileList.filter(f => modList[parse(f).name])
    const modules = await Promise.all(
      fileList.map(filePath => import(pathToFileURL(filePath).href) as unknown as ModuleType),
    )

    modules.forEach((modModule, i) => {
      const source = parse(fileList[i]).name // Mod name or category
      modModule.default((outputs, inputs, catalysts) =>
        recipesStore.addRecipe(`custom:${source}`, outputs, inputs, catalysts),
      )
    })
  }
  return true
}
