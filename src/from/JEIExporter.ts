/* eslint-disable no-console */
import type {
  JEIECategory,
  JEIECustomRecipe,
  JEIEIngredient,
  JEIEItem,
} from 'mc-jeiexporter/build/JEIECategory'
import type { NameMap } from 'mc-jeiexporter/build/NameMap'
import type RecipeStore from '../lib/recipes/RecipeStore'

import type CLIHelper from '../tools/cli-tools'
import type { DefIngrStack } from '../types'
import { readFileSync, statSync } from 'node:fs'
import { join, parse } from 'node:path'
import fast_glob from 'fast-glob'
import getFullId from 'mc-jeiexporter/build/JEIEItem'

import { Stack } from '../api/Stack'
import adapters from '../custom/adapters'
import { naturalSort } from '../lib/utils'
import { createFileLogger } from '../log/logger'

const relPath = 'exports/recipes'

export default async function append_JEIExporter(
  tooltipMap: NameMap,
  toolDurability: Record<string, number> | undefined,
  getTool: (blockId: string) => string | undefined,
  recipeStore: RecipeStore,
  mcDir: string,
  cli: CLIHelper,
) {
  const adapterEntries = [...adapters.entries()]
  const fullId = (ingr: JEIEItem) => getFullId(ingr, tooltipMap, console.log)
  const tools = {
    getFullID: fullId,
    toolDurability: toolDurability ?? {},
    getTool,
  }
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = fast_glob.sync(lookupPath.replace(/\\/g, '/'))
  const getById = recipeStore.definitionStore.getById

  cli.startProgress('JEIE .json\'s', jsonList.length)

  const sorted = jsonList
    .map(filePath => [statSync(filePath).size, filePath] as const)
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v)

  const noRecipeCategories: string[] = []
  const all = Promise.all(sorted.map(handleJEIE))

  all.then(() => {
    cli.bar?.update(cli.bar?.getTotal(), { task: 'done' })
    createFileLogger('noRecipeCategories.log')(noRecipeCategories.sort(naturalSort).join('\n'))
  })

  return all

  async function handleJEIE(filePath: string) {
    const fileName = parse(filePath).name
    cli.startItem(fileName)

    const category: JEIECategory = JSON.parse(readFileSync(filePath, 'utf8'))

    const adapterList = adapterEntries.filter(([rgx]) => rgx.test(fileName))
    adapterList.forEach(([, adapter]) => adapter(category, tools))
    if (!category.recipes.length)
      return

    const customRecipes: JEIECustomRecipe[] = category.recipes
    const defaultCatalysts = category.catalysts.length
      ? new Stack(
        recipeStore.ingredientStore.fromItems(
          category.catalysts.map(i => getById(fullId(i))),
        ),
      )
      : []

    let recipesLength = customRecipes.length
    customRecipes.forEach((rec) => {
      const outputs = convertIngredients(rec.output.items)
      const recipeAdded = outputs.length
        && recipeStore.addRecipe(
          fileName,
          outputs,
          convertIngredients(rec.input.items),
          rec.catalyst ? convertIngredients(rec.catalyst) : defaultCatalysts,
        )
      if (recipeAdded)
        recipesLength--
    })

    if (recipesLength === customRecipes.length)
      noRecipeCategories.push(`⭕ Recipes not added in ${fileName}`)
    else if (recipesLength > 0)
      noRecipeCategories.push(`⚠️ ${recipesLength} Recipes not added in ${fileName}`)

    cli.progressIncrement()
  }

  function convertIngredients(items: JEIEIngredient[]): DefIngrStack[] {
    return items
      .filter(it => it.stacks.some(st => st.name)) // Remove empty stacks
      .map(item => new Stack(getFromStacks(item.stacks), item.amount))
  }

  function getFromStacks(stacks: JEIEItem[]) {
    return recipeStore.ingredientStore.fromItems(
      stacks.map(s => getById(fullId(s))),
    )
  }
}
