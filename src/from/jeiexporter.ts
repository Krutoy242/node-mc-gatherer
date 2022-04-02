import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import PrimalRecipesHelper from '../primal_recipes'

import adapters from './jeie_adapters'

export interface JEIExporterCategory {
  title: string
  width: number
  height: number
  texture: string
  catalysts: string[]
  recipes: Recipe[]
}

interface Recipe {
  input: Input
  output: Input
}

interface Input {
  items: Item[]
}

interface Item {
  amount: number
  stacks: Stack[]
}

interface Stack {
  name: string
}

const relPath = 'config/jeiexporter/exports/recipes/'

export default async function append_JEIExporter(
  recHelper: PrimalRecipesHelper,
  mcDir: string
) {
  const lookupPath = join(mcDir, relPath, '*.json')
  const jsonList = glob.sync(lookupPath)

  console.log(`~~ Found ${jsonList.length} .json JEIExporter files`)

  const sorted = jsonList
    .map((filePath) => [statSync(filePath).size, filePath] as const)
    .sort(([a], [b]) => b - a)
    .map(([, v]) => v)

  return Promise.all(sorted.map((fileName) => handleJEIE(recHelper, fileName)))
}

async function handleJEIE(recHelper: PrimalRecipesHelper, filePath: string) {
  const fileName = parse(filePath).name
  const adapterList = Object.entries(adapters).filter(([rgx]) =>
    fileName.match(rgx)
  )

  let category: JEIExporterCategory = JSON.parse(readFileSync(filePath, 'utf8'))
  adapterList.forEach(([, adapter]) => (category = adapter(category)))
  if (!category.recipes.length) return

  // console.log(`  ~ ${category.title}`)
  const catals = category.catalysts.map((ctl) => recHelper.BH(getStack(ctl)))

  let recipesLength = category.recipes.length
  category.recipes.forEach((recipe) => {
    recHelper.addRecipe(
      convertItems(recHelper, recipe.output.items),
      convertItems(recHelper, recipe.input.items),
      catals
    ) && recipesLength--
  })

  if (recipesLength === category.recipes.length)
    console.log(`   ⭕ NO Recipes not added in [${category.title}] ${fileName}`)
  else if (recipesLength > 0)
    console.log(
      `    ⚠️ ${recipesLength} Recipes not added in [${category.title}] ${fileName}`
    )
}

function convertItems(recHelper: PrimalRecipesHelper, items: Item[]) {
  const list = items
    .filter((it) => it.amount > 0 && it.stacks.some((st) => st.name))
    .map((item) => recHelper.BH(getFromStacks(item.stacks)).amount(item.amount))

  return list
}

function getFromStacks(stacks: Stack[]): string {
  return getStack(stacks[0].name)
}

function getStack(name: string): string {
  const splitted = name.split(':')
  return splitted.length < 4 ? name : splitted.slice(0, 3).join(':')
}
