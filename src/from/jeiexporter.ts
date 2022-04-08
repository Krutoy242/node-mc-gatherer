import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import adapters from '../adapters/jeie'
import RecipeStore from '../lib/RecipeStore'
import Stack from '../lib/Stack'
import { CountableFunction, createFileLogger } from '../log/logger'

import {
  Ingredient,
  Item,
  iTypeAddPrefix,
  ITypes,
  JEIECustomRecipe,
  JEIExporterCategory,
  NameMap,
  Slot,
} from './JEIExporterTypes'
import { OredictMap } from './oredict'

export interface RecipeInfo {
  categoryId: string
  category: JEIExporterCategory
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
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)
  const makeStack = (i: Item, n?: number) =>
    recHelper.definitionStore.getAuto(getFullStack(i)).stack(n)

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

    let category: JEIExporterCategory = JSON.parse(
      readFileSync(filePath, 'utf8')
    )
    adapterList.forEach(
      ([, adapter]) =>
        (category = {
          ...category,
          recipes: adapter(category, getFullStack),
        })
    )
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

  function convertItems(items: Ingredient[]) {
    const list = items
      .filter((it) => it.amount > 0 && it.stacks.some((st) => st.name))
      .map((item) =>
        recHelper.definitionStore
          .getAuto(getFromStacks(item.stacks))
          .stack(item.amount)
      )

    return list
  }

  function getFromStacks(stacks: Item[]): string {
    return getFullStack(stacks[0])
  }

  function getFullStack(ingr: Item): string {
    if (ingr.type === 'oredict') {
      const oreItem = oreDict[ingr.name]
      if (!oreItem) throw new Error('No item found for ore: ' + ingr.name)
      return oreItem
    }

    const splitted = ingr.name.split(':')
    let sNbt = ''
    let base: string
    if (splitted.length > 3) {
      base = splitted.slice(0, 3).join(':')
      if (splitted[3] !== 'f62') {
        // f62 is hash of "{}" - empty nbt. Just clean it
        sNbt = tooltipMap[ingr.type][ingr.name]?.tag ?? ''
      }
    } else base = ingr.name

    let prefix = iTypeAddPrefix[ingr.type]
    if (prefix === undefined) {
      console.log('⚠️  Unregistered JEIExporter type:', ingr.type)
      prefix = 'item'
    }

    return (prefix ? prefix + ':' : '') + base + (sNbt ? ':' + sNbt : '')
  }

  return all
}
