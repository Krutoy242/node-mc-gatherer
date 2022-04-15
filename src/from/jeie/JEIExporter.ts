import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import adapters from '../../custom/adapters'
import Ingredient from '../../lib/items/Ingredient'
import Stack from '../../lib/items/Stack'
import RecipeStore from '../../lib/recipes/RecipeStore'
import { createFileLogger } from '../../log/logger'
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
  recHelper: RecipeStore,
  mcDir: string
) {
  const fullId = (ingr: JEIEItem) => getFullId(ingr, tooltipMap)
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)
  const getById = recHelper.definitionStore.getById
  const makeStack = (i: JEIEItem) => new Stack(getById(fullId(i)))

  console.log(`~~ Found ${jsonList.length} .json JEIExporter files`)

  const sorted = jsonList
    .map((filePath) => [statSync(filePath).size, filePath] as const)
    .sort(([a], [b]) => b - a)
    .map(([, v]) => v)

  const noRecipes = createFileLogger('noRecipesCategory.log')
  // const noOutput = createFileLogger('noRecipeOutput.log')

  const all = Promise.all(sorted.map((fileName) => handleJEIE(fileName)))
  all.then(() => console.log('Recipes problems :>> ', noRecipes.count))

  async function handleJEIE(filePath: string) {
    const fileName = parse(filePath).name
    const adapterList = adapterEntries.filter(([rgx]) => rgx.test(fileName))

    let category: JEIECategory = JSON.parse(readFileSync(filePath, 'utf8'))
    adapterList.forEach(([, adapter]) => adapter(category, fullId))
    if (!category.recipes.length) return

    const customRecipes: JEIECustomRecipe[] = category.recipes
    const defaultCatalysts = category.catalysts.map(makeStack)

    let recipesLength = customRecipes.length
    const addRecipe = recHelper.forCategory(fileName)
    customRecipes.forEach((rec) => {
      const outputs = convertIngredients(rec.output.items)
      outputs.length &&
        addRecipe(
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
  }

  function convertIngredients(items: JEIEIngredient[]): Stack[] {
    return items
      .filter((it) => it.stacks.some((st) => st.name)) // Remove empty stacks
      .map((item) => new Stack(getFromStacks(item.stacks), item.amount))
  }

  function getFromStacks(stacks: JEIEItem[]): Ingredient {
    return new Ingredient(stacks.map((s) => getById(fullId(s))))
  }

  return all
}
