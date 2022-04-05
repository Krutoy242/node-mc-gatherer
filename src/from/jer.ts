import _ from 'lodash'

import RecipeStore from '../lib/RecipeStore'
import Stack from '../lib/Stack'

const { max, round } = Math

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

// type DimensionDisplay = `${string & ''} (${number})`
type DimensionDisplay = string
const worldDifficulty: Record<DimensionDisplay, number> = {
  'Overworld (0)': 1.0,
  'Nether (-1)': 1.0,
  'The End (1)': 1.0,
  'Twilight Forest (7)': 1.0,
  'Ratlantis (-8)': 1.0,
  'Deep Dark (-11325)': 1.0,
  'Luna (100)': 1.0,
  'Mercury (101)': 1.0,
  'Venus (102)': 1.0,
  'Mars (103)': 1.0,
  'Io (105)': 1.0,
  'Europa (106)': 1.0,
  'Titan (108)': 1.0,
  'Uranus (109)': 1.0,
  'Neptune (110)': 1.0,
  'Proxima B (111)': 1.0,
  'Terra Nova (112)': 1.0,
  'Novus (113)': 1.0,
  'Stella (114)': 1.0,
  'KELT-2ab (118)': 1.0,
  'KELT-3 (119)': 1.0,
  'KELT-4ab (120)': 1.0,
  'KELT-6a (121)': 1.0,
  'Kepler 0118 (122)': 1.0,
  'Kepler 0119 (123)': 1.0,
  'Emptiness (14676)': 1.0,
}

const EXPLORATION_MAX_COST = 10000

function dimToID(name: string) {
  return 'placeholder:dim_' + name.toLowerCase()
}

let ii_exploration: Stack
// let ii_pick: Stack
const dimensionPHs: Record<keyof typeof worldDifficulty, Stack> = {}
function dimJERFieldToID(key: string) {
  const matches = key.match(/(.+) \((-?\d+)\)/)
  const name = matches ? matches[1] : key
  return { id: dimToID(name), display: name }
}

// Get maximim difficulty when mining
const H = 255
const MID = 70
function difficulty_from_level(x: number) {
  // return 1
  const b = 7.13
  const c = 44
  const r = (2 ** (b - x / (MID / b)) + x ** 2 / c ** 2) / (MID * 2) - 0.025
  return 1 - Math.min(Math.max(0, r), 1)
}
const maxHeightDiff = _.sum(
  new Array(H).map((_, i) => difficulty_from_level(i))
)

const probFactor = 4

function getJERProbability(rawStrData: string) {
  return (
    _.sum(
      rawStrData
        .split(';')
        .map((s) => s.split(',').map(parseFloat))
        .filter((o) => !isNaN(o[0]))
        .map(
          ([lvl, prob]) =>
            difficulty_from_level(lvl) * prob ** probFactor /* **(1/2) */
        )
    ) / maxHeightDiff
  )
}

export default function append_JER(storeHelper: RecipeStore, jer: JER_Entry[]) {
  ii_exploration = storeHelper.BH('placeholder:exploration')
  // ii_pick = storeHelper.BH('minecraft:stone_pickaxe:0')

  Object.entries(worldDifficulty).forEach(([key]) => {
    const parsed = dimJERFieldToID(key)
    dimensionPHs[key] = storeHelper.BH(parsed.id)
    dimensionPHs[key].definition.display = parsed.display
  })

  for (const jer_entry of jer) {
    handleJerEntry(storeHelper, jer_entry)
  }
}

function handleJerEntry(storeHelper: RecipeStore, jer_entry: JER_Entry) {
  const outID = normJERId(jer_entry.block)
  const outBH = storeHelper.BH(outID)

  // 0 .. 1
  const probability =
    getJERProbability(jer_entry.distrib) **
    (1 / (0.05 * probFactor * EXPLORATION_MAX_COST))

  const worldMultiplier = worldDifficulty[jer_entry.dim] ?? 1.0
  const exploreComplexity = Math.max(
    1,
    worldMultiplier * (1 - probability) * EXPLORATION_MAX_COST
  )

  const dimAddit =
    dimensionPHs[jer_entry.dim] ??
    storeHelper.BH(dimJERFieldToID(jer_entry.dim).id)

  storeHelper.addRecipe(
    'JER',
    outBH,
    ii_exploration.withAmount(exploreComplexity),
    dimAddit
  )

  if (jer_entry.dropsList)
    jer_entry.dropsList.forEach((drop) => handleDrops(storeHelper, outBH, drop))
}

function handleDrops(storeHelper: RecipeStore, block: Stack, drop: DropsEntry) {
  const id = normJERId(drop.itemStack)
  const ads = storeHelper.definitionStore.get(id)

  const fortunes = _.mean(Object.values(drop.fortunes)) || 1.0
  const inp_amount = max(1, round(fortunes < 1 ? 1 / fortunes : 1))
  const out_amount = max(1, round(fortunes))

  // Skip adding if block drop itself
  if (ads === block.definition && out_amount === inp_amount) return
  storeHelper.addRecipe(
    'JER',
    storeHelper.BH(id, out_amount),
    block.withAmount(inp_amount)
    // ii_pick
  )
}

function normJERId(itemStack: string): string {
  return itemStack
  // return itemStack.replace(/^([^:]+:[^:]+:\d+):(\{.*\})$/, '$1$2')
}
