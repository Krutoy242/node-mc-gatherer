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

const typeMap: Record<ITypes, string> = {
  fluid: 'fluid',
  item: '',
  oredict: 'ore',
  'requious.compat.jei.ingredient.Energy': 'fe',
  'crazypants.enderio.base.integration.jei.energy.EnergyIngredient': 'fe',
  'thaumcraft.api.aspects.AspectList': 'aspect',
}

export default async function append_JEIExporter(
  tooltipMap: NameMap,
  oreDict: OredictMap,
  recHelper: RecipeStore,
  mcDir: string
) {
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)
  const makeStack = (i: Item, n?: number) => recHelper.BH(getStack(i), n)

  console.log(`~~ Found ${jsonList.length} .json JEIExporter files`)

  const sorted = jsonList
    .map((filePath) => [statSync(filePath).size, filePath] as const)
    .sort(([a], [b]) => b - a)
    .map(([, v]) => v)

  const log = createFileLogger('noRecipesCategory.log')

  const all = Promise.all(sorted.map((fileName) => handleJEIE(fileName, log)))
  all.then(() => console.log('Recipes problems :>> ', log.count))

  async function handleJEIE(filePath: string, log: CountableFunction) {
    const fileName = parse(filePath).name
    const adapterList = adapterEntries.filter(([rgx]) => rgx.test(fileName))

    let category: JEIExporterCategory = JSON.parse(
      readFileSync(filePath, 'utf8')
    )
    adapterList.forEach(
      ([, adapter]) => (category = { ...category, recipes: adapter(category) })
    )
    if (!category.recipes.length) return

    const customRecipes: JEIECustomRecipe[] = category.recipes
    const defaultCatalysts = category.catalysts.map((ctl) => makeStack(ctl))

    let recipesLength = customRecipes.length
    const addRecipe = recHelper.forCategory(fileName)
    customRecipes.forEach((rec) => {
      addRecipe(
        convertItems(rec.output.items),
        convertItems(rec.input.items),
        rec.catalyst ? convertItems(rec.catalyst) : defaultCatalysts
      ) && recipesLength--
    })

    if (recipesLength === customRecipes.length)
      log(`⭕ Recipes not added in ${fileName}\n`)
    else if (recipesLength > 0)
      log(`⚠️ ${recipesLength} Recipes not added in ${fileName}\n`)
  }

  function convertItems(items: Ingredient[]) {
    const list = items
      .filter((it) => it.amount > 0 && it.stacks.some((st) => st.name))
      .map((item) => recHelper.BH(getFromStacks(item.stacks), item.amount))

    return list
  }

  function getFromStacks(stacks: Item[]): string {
    return getStack(stacks[0])
  }

  function getStack(ingr: Item): string {
    if (ingr.type === 'oredict') {
      const oreItem = oreDict[ingr.name]
      if (!oreItem) throw new Error('No item found for ore: ' + ingr.name)
      return oreItem
    }

    const id = ingr.name
    const splitted = id.split(':')
    let sNbt = ''
    if (splitted.length > 3) {
      // Have hashed NBT
      sNbt = tooltipMap[ingr.type][ingr.name]?.tag ?? ''
    }

    const prefix = typeMap[ingr.type]
    return (
      (prefix ? prefix + ':' : '') +
      (splitted.length < 4 ? id : splitted.slice(0, 3).join(':')) +
      (sNbt ? ':' + sNbt : '')
    )
  }

  return all
}
