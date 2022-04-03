import { readFileSync, statSync } from 'fs'
import { join, parse } from 'path'

import glob from 'glob'

import RecipeStore from '../lib/RecipeStore'

import { Ingredient, JEIExporterCategory, Slot } from './JEIExporterTypes'
import adapters from './jeie_adapters'

const relPath = 'config/jeiexporter/exports/recipes/'

export default async function append_JEIExporter(
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

  return Promise.all(sorted.map((fileName) => handleJEIE(recHelper, fileName)))
}

async function handleJEIE(recHelper: RecipeStore, filePath: string) {
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
    console.log(`   ⭕ NO Recipes not added in ${fileName}`)
  else if (recipesLength > 0)
    console.log(`    ⚠️ ${recipesLength} Recipes not added in ${fileName}`)
}

function convertItems(recHelper: RecipeStore, items: Slot[]) {
  const list = items
    .filter((it) => it.amount > 0 && it.stacks.some((st) => st.name))
    .map((item) => recHelper.BH(getFromStacks(item.stacks), item.amount))

  return list
}

function getFromStacks(stacks: Ingredient[]): string {
  return getStack(stacks[0])
}

function getStack(ingr: Ingredient): string {
  const id = ingr.name
  const splitted = id.split(':')
  return splitted.length < 4 ? id : splitted.slice(0, 3).join(':')
}
