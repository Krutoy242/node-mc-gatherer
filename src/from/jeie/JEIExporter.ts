import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import adapters from '../../custom/adapters'
import Stack from '../../lib/items/Stack'
import { prefferedModSort } from '../../lib/mods/mod_sort'
import RecipeStore from '../../lib/recipes/RecipeStore'
import { CountableFunction, createFileLogger } from '../../log/logger'
import { OredictMap } from '../oredict'

import { IType, iTypePrefix } from './IType'
import {
  JEIECategory,
  JEIECustomRecipe,
  JEIEIngredient,
  JEIEItem,
  JEIESlot,
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
  oreDict: OredictMap,
  recHelper: RecipeStore,
  mcDir: string
) {
  const fullId = (ingr: JEIEItem) => getFullId(ingr, tooltipMap, oreDict)
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)
  const makeStack = (i: JEIEItem, n?: number) =>
    recHelper.definitionStore.getById(fullId(i)).stack(n)

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
    const defaultCatalysts = category.catalysts.map((ctl) => makeStack(ctl))

    let recipesLength = customRecipes.length
    const addRecipe = recHelper.forCategory(fileName)
    customRecipes.forEach((rec) => {
      const outputs = convertItems(rec.output.items)
      outputs.length &&
        addRecipe(
          outputs,
          convertItems(rec.input.items),
          rec.catalyst ? convertItems(rec.catalyst) : defaultCatalysts
        ) &&
        recipesLength--
    })

    if (recipesLength === customRecipes.length)
      noRecipes(`⭕ Recipes not added in ${fileName}\n`)
    else if (recipesLength > 0)
      noRecipes(`⚠️ ${recipesLength} Recipes not added in ${fileName}\n`)
  }

  function convertItems(items: JEIEIngredient[]): Stack[] {
    const list = items
      .filter((it) => it.amount > 0 && it.stacks.some((st) => st.name))
      .map((item) =>
        recHelper.definitionStore
          .getById(getFromStacks(item.stacks))
          .stack(item.amount)
      )

    return list
  }

  function getFromStacks(stacks: JEIEItem[]): string {
    return fullId(
      stacks.length <= 1
        ? stacks[0]
        : stacks
            .map((s) => [s.name.split(':')[0], s] as const)
            .sort(
              (a, b) =>
                prefferedModSort(a[0], b[0]) ||
                a[1].name.length - b[1].name.length
            )[0][1]
    )
  }

  return all
}
