import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import adapters from '../../custom/adapters'
import Ingredient from '../../lib/items/Ingredient'
import Stack from '../../lib/items/Stack'
import RecipeStore from '../../lib/recipes/RecipeStore'
import { createFileLogger } from '../../log/logger'
import CLIHelper from '../../tools/cli-tools'
import { OredictMap } from '../oredict'

import {
  JEIECategory,
  JEIECustomRecipe,
  JEIEIngredient,
  JEIEItem,
} from './JEIECategory'
import getFullId from './JEIEItem'
import { NameMap } from './NameMap'

export interface RecipeInfo {
  categoryId: string
  category: JEIECategory
  makeStack: (id: string, amount: number) => Stack
}

const adapterEntries = [...adapters.entries()]

const relPath = 'exports/recipes'

export default async function append_JEIExporter(
  tooltipMap: NameMap,
  toolDurability: { [id: string]: number } | undefined,
  getTool: (blockId: string) => string | undefined,
  recHelper: RecipeStore,
  mcDir: string,
  cli: CLIHelper
) {
  const fullId = (ingr: JEIEItem) => getFullId(ingr, tooltipMap)
  const tools = {
    getFullID: fullId,
    toolDurability: toolDurability ?? {},
    getTool,
  }
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)
  const getById = recHelper.definitionStore.getById
  const makeStack = (i: JEIEItem) => new Stack(getById(fullId(i)))

  cli.startProgress("JEIE .json's", jsonList.length)

  const sorted = jsonList
    .map((filePath) => [statSync(filePath).size, filePath] as const)
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v)

  const noRecipes = createFileLogger('noRecipesCategory.log')

  const all = Promise.all(sorted.map(handleJEIE))

  all.then(() => cli.bar?.update(cli.bar?.getTotal(), { task: 'done' }))

  return all

  async function handleJEIE(filePath: string) {
    const fileName = parse(filePath).name
    cli.startItem(fileName)

    let category: JEIECategory = JSON.parse(readFileSync(filePath, 'utf8'))

    const adapterList = adapterEntries.filter(([rgx]) => rgx.test(fileName))
    adapterList.forEach(([, adapter]) => adapter(category, tools))
    if (!category.recipes.length) return

    const customRecipes: JEIECustomRecipe[] = category.recipes
    const defaultCatalysts = category.catalysts.map(makeStack)

    let recipesLength = customRecipes.length
    customRecipes.forEach((rec) => {
      const outputs = convertIngredients(rec.output.items)
      outputs.length &&
        recHelper.addRecipe(
          fileName,
          outputs,
          convertIngredients(rec.input.items),
          rec.catalyst ? convertIngredients(rec.catalyst) : defaultCatalysts
        ) &&
        recipesLength--
    })

    if (recipesLength === customRecipes.length)
      noRecipes(`⭕ Recipes not added in ${fileName}\n`)
    else if (recipesLength > 0)
      noRecipes(`⚠️ ${recipesLength} Recipes not added in ${fileName}\n`)

    cli.progressIncrement()
  }

  function convertIngredients(items: JEIEIngredient[]): Stack[] {
    return items
      .filter((it) => it.stacks.some((st) => st.name)) // Remove empty stacks
      .map((item) => new Stack(getFromStacks(item.stacks), item.amount))
  }

  function getFromStacks(stacks: JEIEItem[]): Ingredient {
    return Ingredient.fromDefs(stacks.map((s) => getById(fullId(s))))
  }
}
