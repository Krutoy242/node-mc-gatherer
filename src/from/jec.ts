import { JEC_Types } from '../types'
import { cleanupNbt } from '../utils'
import PrimalStoreHelper from '../additionalsStore'
import PrimalRecipesHelper, { IIngredient } from '../primal_recipes'

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
  cap?: Nbt
  nbt?: Nbt
}

interface Nbt {
  [key: string]: any
}

/**
 * Organize raw Just Enough Calculation json input
 * @param jecGroupsRaw_text raw json file content
 */
export function append_JECgroups(storeHelper: PrimalRecipesHelper, jecGroupsRaw_text: string): void {
  const jec_groups = convertToNormalJson(jecGroupsRaw_text)

  // Try to remove placeholders that created only to extend ingredient count
  const remIndexes = new Set<number>()
  jec_groups.Default.forEach((jec_recipe, recipe_index) => {
    jec_recipe.input = jec_recipe.input.filter((raw) => prepareEntry(raw, true))
    jec_recipe.catalyst = jec_recipe.catalyst.filter((raw) => prepareEntry(raw, true))

    let wasRemoved = false
    function replaceInList(craft: JEC_Recipe, listName: keyof JEC_Recipe, phRaw: JEC_Ingredient) {
      const pos = craft[listName].map((e) => e.content?.name).indexOf(phRaw.content.name)

      if (pos != -1 && craft[listName][pos].type === 'placeholder') {
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
          mutateOreToItemstack(storeHelper, raw)
        }
      }
    }

    if (wasRemoved) {
      remIndexes.add(recipe_index)
    } else {
      jec_recipe.input.forEach((obj_input) => {
        // Replace oredict to itemstacks if needed
        mutateOreToItemstack(storeHelper, obj_input)
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
}

/**
 * Since JEC default formal content sNBT values like `1b`
 * We need to remove type letters (like 2L or 0b)
 * @param jecGroupsRaw_text raw json file content
 * @returns normalized ready-to-parse json object
 */
function convertToNormalJson(jecGroupsRaw_text: string): JEC_RootObject {
  return JSON.parse(
    jecGroupsRaw_text
      .replace(/\[\w;/g, '[') // Remove list types
      .replace(/([[, ]-?\d+(?:\.\d+)?)[ILBbsfd](?=\W)/gi, '$1')
  )
}

// Replace oredict to itemstacks if needed
function mutateOreToItemstack(storeHelper: PrimalStoreHelper, raw: JEC_Ingredient) {
  if (raw.type === 'oreDict' && raw.content.name) {
    const oreAlias = storeHelper.get(raw.content.name)
    if (!oreAlias) {
      console.log('Cant find OreDict name for:', raw.content.name)
    } else {
      raw.type = 'itemStack'
      raw.content = {
        ...raw.content,
        name: undefined,
        item: oreAlias.item,
        meta: oreAlias.meta,
      }
    }
  }
}

function prepareEntry(raw: JEC_Ingredient, isMutate = false) {
  if (raw.type === 'empty') return false

  cleanupNbt(raw.content.nbt)

  if (isMutate) {
    const nbt = raw.content?.nbt

    // Replace bucket with liquid to actual liquid
    if (raw.content?.item === 'forge:bucketfilled') {
      raw.type = 'fluidStack'
      raw.content = {
        amount: 1000,
        fluid: nbt?.FluidName || '<<Undefined Fluid>>',
      }
    }
  }
  return true
}

function applyToAdditionals(storeHelper: PrimalRecipesHelper, jec_groups: JEC_RootObject) {
  const fromJECMap = (raw: JEC_Ingredient) => fromJEC(storeHelper, raw)
  jec_groups.Default.forEach(({ input, output, catalyst }) => {
    storeHelper.addRecipe(output.map(fromJECMap), input.map(fromJECMap), catalyst.map(fromJECMap))
  })
}

function amount_jec(raw: JEC_Ingredient) {
  return ((raw.content.amount ?? 1.0) * (raw.content.percent ?? 100.0)) / 100.0
}

function fromJEC(storeHelper: PrimalStoreHelper, raw: JEC_Ingredient): IIngredient {
  type Triple = [string, string, number?]
  const [source, entry, meta] = (
    {
      itemStack: (): Triple => [...(raw.content?.item?.split(':') as [string, string]), raw.content.meta ?? 0],
      fluidStack: (): Triple => ['fluid', raw.content.fluid as string],
      oreDict: (): Triple => ['ore', raw.content.name as string],
      placeholder: (): Triple => ['placeholder', raw.content.name as string],
    } as Record<string, () => Triple>
  )[raw.type]()

  const ingr_prim = new IIngredient(storeHelper, `${source}:${entry}` + (raw.content.fMeta ? '' : ':' + (meta ?? 0)))
  const ingr_secd = raw.content.fNbt ? ingr_prim : ingr_prim.withTag(cleanupNbt(raw.content.nbt))

  return ingr_secd.amount(amount_jec(raw))
}
