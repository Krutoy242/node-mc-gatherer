import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import adapters from '../adapters/jeie'
import RecipeStore from '../lib/RecipeStore'
import { CountableFunction, createFileLogger } from '../log/logger'

import {
  Ingredient,
  ITypes,
  JEIExporterCategory,
  NameMap,
  Slot,
} from './JEIExporterTypes'

const adapterEntries = [...adapters.entries()]

const relPath = 'exports/recipes'

export default async function append_JEIExporter(
  tooltipMap: NameMap,
  recHelper: RecipeStore,
  mcDir: string
) {
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)

  console.log(`~~ Found ${jsonList.length} .json JEIExporter files`)

  const sorted = jsonList
    .map((filePath) => [statSync(filePath).size, filePath] as const)
    .sort(([a], [b]) => b - a)
    .map(([, v]) => v)

  const log = createFileLogger('noRecipesCategory.log')

  const all = Promise.all(
    sorted.map((fileName) => handleJEIE(tooltipMap, recHelper, fileName, log))
  )
  all.then(() => console.log('Recipes problems :>> ', log.count))
  return all
}

async function handleJEIE(
  tooltipMap: NameMap,
  recHelper: RecipeStore,
  filePath: string,
  log: CountableFunction
) {
  const fileName = parse(filePath).name
  const adapterList = adapterEntries.filter(([rgx]) => rgx.test(fileName))

  let category: JEIExporterCategory = JSON.parse(readFileSync(filePath, 'utf8'))
  adapterList.forEach(([, adapter]) => (category = adapter(category)))
  if (!category.recipes.length) return

  // console.log(`  ~ ${category.title}`)
  const catals = category.catalysts.map((ctl) =>
    recHelper.BH(getStack(tooltipMap, ctl))
  )

  let recipesLength = category.recipes.length
  const addRecipe = recHelper.forCategory(fileName)
  category.recipes.forEach((recipe) => {
    addRecipe(
      convertItems(tooltipMap, recHelper, recipe.output.items),
      convertItems(tooltipMap, recHelper, recipe.input.items),
      catals
    ) && recipesLength--
  })

  if (recipesLength === category.recipes.length)
    log(`⭕ NO Recipes not added in ${fileName}\n`)
  else if (recipesLength > 0)
    log(`⚠️ ${recipesLength} Recipes not added in ${fileName}\n`)
}

function convertItems(
  tooltipMap: NameMap,
  recHelper: RecipeStore,
  items: Slot[]
) {
  const list = items
    .filter((it) => it.amount > 0 && it.stacks.some((st) => st.name))
    .map((item) =>
      recHelper.BH(getFromStacks(tooltipMap, item.stacks), item.amount)
    )

  return list
}

function getFromStacks(tooltipMap: NameMap, stacks: Ingredient[]): string {
  return getStack(tooltipMap, stacks[0])
}

const typeMap: Record<ITypes, string> = {
  fluid: 'fluid',
  item: '',
  oredict: 'ore',
  'requious.compat.jei.ingredient.Energy': 'fe',
  'crazypants.enderio.base.integration.jei.energy.EnergyIngredient': 'fe',
  'thaumcraft.api.aspects.AspectList': 'aspect',
}

function getStack(tooltipMap: NameMap, ingr: Ingredient): string {
  const id = ingr.name
  const prefix = typeMap[ingr.type]
  const splitted = id.split(':')
  let sNbt = ''
  if (splitted.length > 3) {
    // Have hashed NBT
    sNbt = tooltipMap[ingr.type][ingr.name]?.tag ?? ''
  }
  return (
    (prefix ? prefix + ':' : '') +
    (splitted.length < 4 ? id : splitted.slice(0, 3).join(':')) +
    (sNbt ? ':' + sNbt : '')
  )
}
