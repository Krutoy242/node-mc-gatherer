import _ from 'lodash'

import { Stack } from '../api'
import getTool from '../custom/mining_levels'
import type Definition from '../lib/items/Definition'
import type RecipeStore from '../lib/recipes/RecipeStore'
import { createFileLogger } from '../log/logger'
import type { DefIngrStack } from '../types'

import type { BlockMinings } from './blockMinings'

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
  '0'?: number
  '1'?: number
  '2'?: number
  '3'?: number
}

// Get maximim difficulty when mining
const maxHeight = 255
const MID = 70
function difficulty_from_level(x: number) {
  const b = 7.13
  const c = 44
  const r = (2 ** (b - x / (MID / b)) + x ** 2 / c ** 2) / (MID * 2) - 0.025
  return 1 + Math.min(Math.max(0, r), 1)
}

const maxHeightDiff = new Array(maxHeight)
  .fill(0)
  .map((_a, i) => difficulty_from_level(i))
  .reduce((a, b) => a + b)

const probFactor = 0.9

function getProbAcces(lvl: number, prob: number): number {
  return (difficulty_from_level(lvl) * prob ** probFactor) / maxHeightDiff
}

function getJERProbability(rawStrData: string) {
  return (
    1
    / rawStrData
      .split(';')
      .map(s => s.split(',').map(parseFloat))
      .filter(o => !isNaN(o[0]))
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
  blockMinings?: BlockMinings
) {
  const logExploration = createFileLogger('jer_exploration.log')
  const logDimensions = createFileLogger('jer_dimensions.log')
  const getById = recipesStore.definitionStore.getById

  const ii_exploration = Stack.fromString(
    'placeholder:exploration',
    recipesStore.ingredientStore.get
  )

  const exploreAmounts: { [dim: string]: { [id: string]: number } } = {}
  for (const jer_entry of jer) {
    const blockDef = getById(jer_entry.block)
    const block = new Stack(recipesStore.ingredientStore.fromItem(blockDef))
    const exploreAmount = getJERProbability(jer_entry.distrib)
    const catalysts = [jerDimToPlaceholder(jer_entry.dim)]
    const tool = getTool(blockMinings, jer_entry.block)
    if (tool) catalysts.push(tool)

    recipesStore.addRecipe(
      'JER',
      block,
      ii_exploration.withAmount(exploreAmount),
      catalysts
    )

    // Block drops
    const drops = jer_entry.dropsList
      ?.map(drop => getDrops(blockDef, drop))
      .filter((s): s is DefIngrStack => !!s)

    if (drops?.length) recipesStore.addRecipe('JER_Drops', drops, block, tool)
    ;(exploreAmounts[jer_entry.dim] ??= {})[blockDef.id] = exploreAmount
  }

  function getDrops(
    blockDef: Definition,
    drop: DropsEntry
  ): DefIngrStack | undefined {
    const outAmount = _.mean(Object.values(drop.fortunes)) || 1

    // Skip adding if block drop itself
    if (drop.itemStack === blockDef.id && outAmount === 1) return

    return new Stack(
      recipesStore.ingredientStore.fromItem(getById(drop.itemStack)),
      outAmount
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
  }`
    )
  )

  logDimensions([...registeredDims].sort().join('\n'))

  return true
}
