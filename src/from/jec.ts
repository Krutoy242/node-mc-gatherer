// import { writeFileSync } from 'fs'

import type RecipeStore from '../lib/recipes/RecipeStore'
import { Stack } from '../api/Stack'
import { createFileLogger } from '../log/logger'

export type JEC_Types =
  | 'itemStack'
  | 'fluidStack'
  | 'oreDict'
  | 'placeholder'
  | 'empty'

interface JEC_RootObject {
  Default: JEC_Recipe[]
}

interface JEC_Recipe {
  output: JEC_Ingredient[]
  input: JEC_Ingredient[]
  catalyst: JEC_Ingredient[]
}

interface JEC_Ingredient {
  type: JEC_Types
  content: JEC_Content
}

interface JEC_Content {
  amount: number
  item?: string
  meta?: number
  fluid?: string
  name?: string
  percent?: number
  fMeta?: number
  fCap?: number
  fNbt?: number
  nbt?: string
  cap?: Nbt
}

interface Nbt {
  [key: string]: never
}

const logRecipe = createFileLogger('jecRecipes.log')

/**
 * Organize raw Just Enough Calculation json input
 * @param storeHelper
 * @param jecGroupsRaw_text raw json file content
 */
export default function append_JECgroups(
  storeHelper: RecipeStore,
  jecGroupsRaw_text: string,
): number {
  const jec_groups = convertToNormalJson(jecGroupsRaw_text)

  // Try to remove placeholders that created only to extend ingredient count
  const remIndexes = new Set<number>()
  jec_groups.Default.forEach((jec_recipe, recipe_index) => {
    jec_recipe.input = jec_recipe.input.filter(raw => prepareEntry(raw, true))
    jec_recipe.catalyst = jec_recipe.catalyst.filter(raw =>
      prepareEntry(raw, true),
    )

    let wasRemoved = false
    function replaceInList(
      craft: JEC_Recipe,
      listName: keyof JEC_Recipe,
      phRaw: JEC_Ingredient,
    ) {
      const pos = craft[listName]
        .map(e => e.content?.name)
        .indexOf(phRaw.content.name)

      if (pos !== -1 && craft[listName][pos].type === 'placeholder') {
        craft[listName].splice(pos, 1)
        craft[listName] = craft[listName].concat(jec_recipe.input)
        wasRemoved = true
      }
    }

    // Special case for placeholder in output:
    // Add its all inputs to recipe where it represent input
    let i = jec_recipe.output.length
    while (i--) {
      const raw = jec_recipe.output[i]
      if (!prepareEntry(raw)) {
        jec_recipe.output.splice(i, 1)
      }
      else {
        if (raw.type === 'placeholder') {
          jec_groups.Default.forEach((craft) => {
            replaceInList(craft, 'input', raw)
            // replaceInList(craft, 'catalyst', raw);
          })
        }
      }
    }

    if (wasRemoved)
      remIndexes.add(recipe_index)
  })

  // Make indexes unique and remove
  Array.from(remIndexes)
    .reverse()
    .forEach(index => jec_groups.Default.splice(index, 1))

  // -------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------

  applyToAdditionals(storeHelper, jec_groups)

  return jec_groups.Default.length
}

function fixNBT(str: string): string {
  return str
    .split(/"nbt"\s*:\s*/)
    .map((s, i) => (i === 0 ? s : shortandNbt(s)))
    .join('"nbt": ')
}

function shortandNbt(str: string) {
  let parenth = 0
  let i = 0
  while (i < str.length) {
    if (str[i] === '{')
      parenth++
    if (str[i] === '}')
      parenth--
    i++
    if (parenth <= 0)
      break
  }
  return (
    `"${
      str
        .substring(0, i)
        .replace(/\s*"([^"]+)"\s*:\s*/g, '$1:')
        .replace(/"/g, '\\"')
        .replace(/\s*\n\s*/g, '')
    }"${
      str.substring(i)}`
  )
}

/**
 * Since JEC default formal content sNBT values like `1b`
 * We need to remove type letters (like 2L or 0b)
 * @param jecGroupsRaw_text raw json file content
 * @returns normalized ready-to-parse json object
 */
function convertToNormalJson(jecGroupsRaw_text: string): JEC_RootObject {
  const fixedText = fixNBT(jecGroupsRaw_text)
    .replace(/\[\w;/g, '[') // Remove list types
    .replace(/("[^"]+":\s*-?\d+(?:\.\d+)?)[ILBsfd]\b/gi, '$1')

  // writeFileSync('~jec.json', fixedText)
  return JSON.parse(fixedText)
}

function prepareEntry(raw: JEC_Ingredient, isMutate = false) {
  if (raw.type === 'empty')
    return false

  if (isMutate) {
    const nbt = raw.content?.nbt

    // Replace bucket with liquid to actual liquid
    if (raw.content?.item === 'forge:bucketfilled') {
      const fluidName = nbt?.match(/FluidName:\s*\\?"([^"]+?)\\?"/)?.[1]
      if (!fluidName)
        throw new Error('Cant parse fluid name')

      raw.type = 'fluidStack'
      raw.content = {
        amount: 1000,
        fluid: fluidName,
      }
    }
  }
  return true
}

function applyToAdditionals(
  recipeStore: RecipeStore,
  jec_groups: JEC_RootObject,
) {
  jec_groups.Default.forEach(({ input, output, catalyst }) => {
    const rec = recipeStore.addRecipe(
      'JEC',
      output.map(fromJECMap),
      input.map(fromJECMap),
      catalyst.map(fromJECMap),
    )
    logRecipe(`${rec?.commandString({ noSource: true })}\n`)
  })

  function fromJECMap(raw: JEC_Ingredient) {
    type Typle = [string, string, string?]

    const switcher: Record<string, () => Typle> = {
      itemStack: (): Typle => [
        ...(raw.content?.item?.split(':') as [string, string]),
        raw.content.fMeta ? '*' : String(raw.content.meta ?? 0),
      ],
      fluidStack: (): Typle => ['fluid', raw.content.fluid as string],
      oreDict: (): Typle => ['ore', raw.content.name as string],
      placeholder: (): Typle => [
        'placeholder',
        ...raw.content.name?.toLowerCase().split(':') as [string, string?],
      ],
    }

    const [source, entry, meta] = switcher[raw.type]()
    const sNbt
      = raw.content.fNbt && !raw.content.fMeta
        ? '*'
        : typeof raw.content.nbt !== 'string'
          ? ''
          : raw.content.nbt

    return new Stack(
      recipeStore.ingredientStore.fromItem(
        recipeStore.definitionStore.getBased(source, entry, meta, sNbt),
      ),
      amount_jec(raw),
    )
  }
}

function amount_jec(raw: JEC_Ingredient) {
  return ((raw.content.amount ?? 1.0) * (raw.content.percent ?? 100.0)) / 100.0
}
