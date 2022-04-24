import _ from 'lodash'

import getTool from '../custom/mining_levels'
import Definition from '../lib/items/Definition'
import Stack from '../lib/items/Stack'
import RecipeStore from '../lib/recipes/RecipeStore'
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
    1 /
    rawStrData
      .split(';')
      .map((s) => s.split(',').map(parseFloat))
      .filter((o) => !isNaN(o[0]))
      .map(([lvl, prob]) => getProbAcces(lvl, prob))
      .reduce((a, b) => a + b, 0)
  )
}

const registeredDims: Set<string> = new Set()
function jerDimToPlaceholder(jerDimText: string): string {
  const dim = jerDimText
    .toLowerCase()
    .replace(/[: ]/g, '_')
    .replace(/[()]/g, '')
  registeredDims.add(dim)
  return 'dimension:' + dim
}

export default function append_JER(
  recipesStore: RecipeStore,
  jer: JER_Entry[],
  crafttweakerLogTxt: string
) {
  const logExploration = createFileLogger('jer_exploration.log')
  const logDimensions = createFileLogger('jer_dimensions.log')
  const blockMinings = generateBlockMinings(crafttweakerLogTxt)
  const getById = recipesStore.definitionStore.getById

  let ii_exploration = Stack.fromString('placeholder:exploration', getById)

  const exploreAmounts: { [dim: string]: { [id: string]: number } } = {}
  for (const jer_entry of jer) {
    const blockDef = getById(jer_entry.block)
    const block = new Stack(blockDef)
    const exploreAmount = getJERProbability(jer_entry.distrib)
    const catalysts = [jerDimToPlaceholder(jer_entry.dim)]
    const tool = generateTool(jer_entry.block)
    if (tool) catalysts.push(tool)

    recipesStore.addRecipe(
      'JER',
      block,
      ii_exploration.withAmount(exploreAmount),
      catalysts
    )

    // Block drops
    const drops = jer_entry.dropsList
      ?.map((drop) => getDrops(blockDef, drop))
      .filter((s): s is Stack => !!s)

    if (drops?.length) recipesStore.addRecipe('JER', drops, block, tool)
    ;(exploreAmounts[jer_entry.dim] ??= {})[blockDef.id] = exploreAmount
  }

  function generateTool(blockId: string): string | undefined {
    const bMining = blockMinings[blockId]
    if (!bMining) return
    return getTool(bMining.toolClass, bMining.level)
  }

  function getDrops(blockDef: Definition, drop: DropsEntry): Stack | undefined {
    const outAmount = _.mean(Object.values(drop.fortunes)) || 1

    // Skip adding if block drop itself
    if (drop.itemStack === blockDef.id && outAmount === 1) return

    return new Stack(getById(drop.itemStack), outAmount)
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
}

export interface BlockMinings {
  [id: string]: {
    hardness: number
    toolClass: string
    level: number
  }
}

function getTextFromTo(text: string, from: string, to: string): string {
  const startIndex = text.indexOf(from)
  if (startIndex === -1) return ''

  const sub = text.substring(startIndex + from.length)
  const endIndex = sub.indexOf(to)

  return endIndex === -1 ? sub : sub.substring(0, endIndex)
}

function generateBlockMinings(crafttweakerLogTxt: string): BlockMinings {
  const txtBlock = getTextFromTo(
    crafttweakerLogTxt,
    '#          Harvest tool and level                #',
    '##################################################'
  )
  if (!txtBlock) throw new Error('Cant read harvest data from crafttweaker.log')

  const result: BlockMinings = {}
  for (const { groups } of txtBlock.matchAll(
    /^\[SERVER_STARTED\]\[SERVER\]\[INFO\] <(?<id>[^>]+)> = (?<hardness>[^:]+):(?<toolClass>[^:]+):(?<level>.+)$/gm
  )) {
    if (!groups) continue
    result[groups.id] = {
      hardness: Number(groups.hardness),
      toolClass: groups.toolClass,
      level: Number(groups.level),
    }
  }
  return result
}
