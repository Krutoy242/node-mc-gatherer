import DefinitionStore from '../lib/items/DefinitionStore'
import Stack from '../lib/items/Stack'
import RecipeStore from '../lib/recipes/RecipeStore'

import { OredictMap } from './oredict'

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

/**
 * Organize raw Just Enough Calculation json input
 * @param jecGroupsRaw_text raw json file content
 */
export default function append_JECgroups(
  storeHelper: RecipeStore,
  dict: OredictMap,
  jecGroupsRaw_text: string
): number {
  const jec_groups = convertToNormalJson(jecGroupsRaw_text)

  // Try to remove placeholders that created only to extend ingredient count
  const remIndexes = new Set<number>()
  jec_groups.Default.forEach((jec_recipe, recipe_index) => {
    jec_recipe.input = jec_recipe.input.filter((raw) => prepareEntry(raw, true))
    jec_recipe.catalyst = jec_recipe.catalyst.filter((raw) =>
      prepareEntry(raw, true)
    )

    let wasRemoved = false
    function replaceInList(
      craft: JEC_Recipe,
      listName: keyof JEC_Recipe,
      phRaw: JEC_Ingredient
    ) {
      const pos = craft[listName]
        .map((e) => e.content?.name)
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
      } else {
        if (raw.type === 'placeholder') {
          jec_groups.Default.forEach((craft) => {
            replaceInList(craft, 'input', raw)
            // replaceInList(craft, 'catalyst', raw);
          })
        } else {
          // Replace oredict to itemstacks if needed
          mutateOreToItemstack(dict, raw)
        }
      }
    }

    if (wasRemoved) {
      remIndexes.add(recipe_index)
    } else {
      jec_recipe.input.forEach((obj_input) => {
        // Replace oredict to itemstacks if needed
        mutateOreToItemstack(dict, obj_input)
      })
    }
  })

  // Make indexes unique and remove
  Array.from(remIndexes)
    .reverse()
    .forEach((index) => jec_groups.Default.splice(index, 1))

  // -------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------

  applyToAdditionals(storeHelper, jec_groups)

  return jec_groups.Default.length
}

function shortandNbt(str: string) {
  let parenth = 0
  let i = 0
  while (i < str.length) {
    if (str[i] === '{') parenth++
    if (str[i] === '}') parenth--
    i++
    if (parenth <= 0) break
  }
  return (
    '"' +
    str
      .substring(0, i)
      // .replace(/([[, ]-?\d+(?:\.\d+)?)[ILBbsfd](?=\W)/gi, '$1')
      .replace(/[\s\n]*"([^"]+)"[\s\n]*:[\s\n]*/gi, '$1:')
      .replace(/"/g, '\\"')
      .replace(/[\s\n]*\n+[\s\n]*/g, '') +
    '"' +
    str.substring(i)
  )
}

/**
 * Since JEC default formal content sNBT values like `1b`
 * We need to remove type letters (like 2L or 0b)
 * @param jecGroupsRaw_text raw json file content
 * @returns normalized ready-to-parse json object
 */
function convertToNormalJson(jecGroupsRaw_text: string): JEC_RootObject {
  const fixedText = jecGroupsRaw_text
    .replace(/\[\w;/g, '[') // Remove list types
    .replace(
      // Turn nbt to sNbt
      /(^ {12}"content": \{\n(?:.+\n){1,5} {16}"nbt": )(\{[\s\S\n]+?\n {16}\})/gm,
      (_m, prefix, nbtStr) => {
        return `${prefix}${shortandNbt(nbtStr)}`
      }
    )
    .replace(
      // Turn nbt to sNbt
      /(^ {16}"content": \{\n(?:.+\n){1,5} {20}"nbt": )(\{[\s\S\n]+?\n {20}\})/gm,
      (_m, prefix, nbtStr) => {
        return `${prefix}${shortandNbt(nbtStr)}`
      }
    )
    .replace(/("[^"]+":\s*-?\d+(?:\.\d+)?)[ILBbsfd]\b/gi, '$1')
  return JSON.parse(fixedText)
}

// Replace oredict to itemstacks if needed
function mutateOreToItemstack(dict: OredictMap, raw: JEC_Ingredient) {
  if (raw.type === 'oreDict' && raw.content.name) {
    const oreAlias = dict[raw.content.name]
    if (!oreAlias) {
      console.log('Cant find OreDict name for:', raw.content.name)
    } else {
      const splitted = oreAlias.split(':')
      raw.type = 'itemStack'
      raw.content = {
        ...raw.content,
        name: undefined,
        item: splitted.slice(0, 2).join(':'),
        meta: Number(splitted.pop()) | 0,
      }
    }
  }
}

function prepareEntry(raw: JEC_Ingredient, isMutate = false) {
  if (raw.type === 'empty') return false

  if (isMutate) {
    const nbt = raw.content?.nbt

    // Replace bucket with liquid to actual liquid
    if (raw.content?.item === 'forge:bucketfilled') {
      raw.type = 'fluidStack'
      raw.content = {
        amount: 1000,
        fluid:
          nbt?.match(/FluidName:\\"([^"]+)\\"/)?.[1] || '<<Undefined Fluid>>',
      }
    }
  }
  return true
}

function applyToAdditionals(
  storeHelper: RecipeStore,
  jec_groups: JEC_RootObject
) {
  const fromJECMap = (raw: JEC_Ingredient) =>
    fromJEC(storeHelper.definitionStore, raw)
  const addRecipe = storeHelper.forCategory('JEC')
  jec_groups.Default.forEach(({ input, output, catalyst }) => {
    addRecipe(
      output.map(fromJECMap),
      input.map(fromJECMap),
      catalyst.map(fromJECMap)
    )
  })
}

function amount_jec(raw: JEC_Ingredient) {
  return ((raw.content.amount ?? 1.0) * (raw.content.percent ?? 100.0)) / 100.0
}

function fromJEC(storeHelper: DefinitionStore, raw: JEC_Ingredient): Stack {
  type Typle = [string, string, number?]
  const switcher: Record<string, () => Typle> = {
    itemStack: (): Typle => [
      ...(raw.content?.item?.split(':') as [string, string]),
      raw.content.meta ?? 0,
    ],
    fluidStack: (): Typle => ['fluid', raw.content.fluid as string],
    oreDict: (): Typle => ['ore', raw.content.name as string],
    placeholder: (): Typle => [
      'placeholder',
      raw.content.name?.toLowerCase() as string,
    ],
  }
  const [source, entry, meta] = switcher[raw.type]()

  const sNbt = raw.content.fNbt
    ? ''
    : typeof raw.content.nbt !== 'string'
    ? ''
    : raw.content.nbt

  return new Stack(
    storeHelper.getBased(source, entry, raw.content.fMeta ? 0 : meta, sNbt),
    amount_jec(raw)
  )
}
