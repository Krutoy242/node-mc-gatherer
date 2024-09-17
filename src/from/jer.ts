import type Definition from '../lib/items/Definition'

import type RecipeStore from '../lib/recipes/RecipeStore'
import type { DefIngrStack } from '../types'
import type { BlockMinings } from './blockMinings'
import _ from 'lodash'
import { Stack } from '../api/Stack'
import getMiningPlaceholder from '../custom/mining_levels'

import { createFileLogger } from '../log/logger'

interface JER_Entry {
  block: string
  distrib: string
  silktouch: boolean
  dim: string
  dropsList?: DropsEntry[]
}

interface DropsEntry {
  itemStack: string
  fortunes: Fortunes
}

interface Fortunes {
  0?: number
  1?: number
  2?: number
  3?: number
}

// Max world height
const maxHeight = 255

// Surface level
const MID = 70

function difficulty_from_level(x: number) {
  return 1 + (x > MID
    ? (x - MID) / 300
    : (MID - x) ** 1.6 / MID)
}

const maxHeightDiff = Array.from({ length: maxHeight })
  .fill(0)
  .map((_a, i) => difficulty_from_level(i))
  .reduce((a, b) => a + b)

// Exponent of probability
// Increase cost of items with high probabilities
// but make low-prob items not so costy
const probFactor = 0.9

// Globally Discrease cost of
const globalCostMultiplicator = 1 / 5

// Dimension discount
const dimMultiplier: Record<string, number> = {
  'dimension:1': 0.1,
}

function getProbAcces(lvl: number, prob: number): number {
  return (difficulty_from_level(lvl) * prob ** probFactor) / maxHeightDiff / globalCostMultiplicator
}

function getFullId(anyId: string) {
  return anyId + (anyId.match(/^[^:]+:[^:]+$/) ? ':0' : '')
}

function getJERProbability(rawStrData: string) {
  return (
    1
    / rawStrData
      .split(';')
      .map(s => s.split(',').map(Number.parseFloat))
      .filter(o => !Number.isNaN(o[0]))
      .map(([lvl, prob]) => getProbAcces(lvl, prob))
      .reduce((a, b) => a + b, 0)
  )
}

const registeredDims: Set<string> = new Set()
function jerDimToPlaceholder(jerDimText: string): string {
  const match = jerDimText.toLowerCase().match(/\((.+)\)|^.+: (-?\d+|[\w ]+)$/)
  const dimId = match?.[1] ?? match?.[2] ?? jerDimText
  const dim = dimId.replace(/[:\s]/g, '_')
  registeredDims.add(dim)
  return `dimension:${dim}`
}

export default function append_JER(
  recipesStore: RecipeStore,
  jer: JER_Entry[],
  blockMinings?: BlockMinings,
) {
  const logExploration = createFileLogger('jer_exploration.log')
  const logDimensions = createFileLogger('jer_dimensions.log')
  const getById = recipesStore.definitionStore.getById

  const ii_exploration = Stack.fromString(
    'placeholder:exploration',
    recipesStore.ingredientStore.get,
  )

  const exploreAmounts: { [dim: string]: { [id: string]: number } } = {}
  for (const jer_entry of jer) {
    const blockID = getFullId(jer_entry.block)
    const blockDef = getById(blockID)
    const block = new Stack(recipesStore.ingredientStore.fromItem(blockDef))
    const dimPlaceholder = jerDimToPlaceholder(jer_entry.dim)
    const exploreAmount = Math.max(0, Math.round(getJERProbability(jer_entry.distrib) * (dimMultiplier[dimPlaceholder] ?? 1)))
    const exploreIngr = ii_exploration.withAmount(exploreAmount)
    const miningPH = getMiningPlaceholder(blockMinings, blockID)
    const catalysts = [dimPlaceholder]
    if (miningPH)
      catalysts.push(miningPH)

    if (!/block.?drops/.test(jer_entry.dim.toLowerCase())) // Special case for custom E2EE category "Block Drops"
      recipesStore.addRecipe('JER', block, exploreIngr, catalysts)

    // Block drops
    const drops = jer_entry.dropsList
      ?.map(drop => getDrops(blockDef, drop))
      .filter((s): s is DefIngrStack => !!s)

    const isQuarkPot = drops?.some(i => i.it.id.includes('minecraft:flower_pot'))
    if (drops?.length && !isQuarkPot)
      recipesStore.addRecipe('JER_Drops', drops, block, miningPH)
    ;(exploreAmounts[jer_entry.dim] ??= {})[blockDef.id] = exploreAmount
  }

  function getDrops(
    blockDef: Definition,
    drop: DropsEntry,
  ): DefIngrStack | undefined {
    const outAmount = _.mean(Object.values(drop.fortunes)) || 1

    const fullId = getFullId(drop.itemStack)

    // Skip adding if block drop itself
    if (fullId === blockDef.id && outAmount === 1)
      return

    return new Stack(
      recipesStore.ingredientStore.fromItem(getById(fullId)),
      outAmount,
    )
  }

  logExploration(
    Object.entries(exploreAmounts).map(
      ([dim, o]) => `
"${dim}": {
${Object.entries(o)
    .sort(([, a], [, b]) => a - b)
    .map(([id, n]) => `  ${n} ${id}`)
    .join('\n')}
  }`,
    ),
  )

  logDimensions([...registeredDims].sort().join('\n'))

  return true
}
