import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, parse } from 'path'

import _ from 'lodash'

import Calculable from '../lib/calc/Calculable'
import Definition from '../lib/items/Definition'
import { DefinitionStack } from '../lib/items/DefinitionStack'
import IngredientStack from '../lib/items/IngredientStack'
import Recipe from '../lib/recipes/Recipe'

import Playthrough from './Playthrough'

export interface CountableFunction {
  (...args: unknown[]): void
  count: number
}

export function createFileLogger(logFileName: string): CountableFunction {
  let firstCall = true
  const filePath = join('logs/', logFileName)
  const fnc = function (...args: unknown[]) {
    if (firstCall) {
      firstCall = false
      mkdirSync(parse('logs/' + logFileName).dir, { recursive: true })
      writeFileSync(filePath, '')
    }

    appendFileSync(filePath, args.map((v) => String(v)).join(' '))
    fnc.count = (fnc.count ?? 0) + 1
  } as CountableFunction
  return fnc
}

export function logTreeTo(def: Definition, write: (str: string) => void) {
  const writeLn = (s: string) => write(s + '\n')

  const playthrough = new Playthrough()

  defToString(def, 1)

  return playthrough

  function defToString(
    def: Definition,
    amount: number,
    complexityPad = 1,
    antiloop = new Set<string>(),
    tabLevel = 0
  ) {
    if (antiloop.has(def.id)) return
    antiloop.add(def.id)

    const tab = '  '.repeat(tabLevel)
    writeLn(tab + def.toString({ complexityPad }))

    if (!def.recipes || def.recipes.size === 0) return // No recipes

    const recipe = def.mainRecipe ?? [...def.recipes].sort(recipeSorter)[0]
    recipe
      .toString()
      .split('\n')
      .forEach((line) => writeLn(tab + '  ' + line))

    const catalysts = IngredientStack.toDefStacks(recipe.catalysts)
    const usages = IngredientStack.toDefStacks(recipe.inputs)

    playthrough.addCatalysts(catalysts)
    playthrough.addInputs(usages, amount)

    const combined = _.uniqBy([catalysts, usages].flat(), (ms) => ms.it.id)
    const maxPad = Math.max(...combined.map((ms) => ms.it.complexity_s.length))

    const onHold = new Set<string>()
    combined.forEach((ms) => {
      if (antiloop.has(ms.it.id)) return
      onHold.add(ms.it.id)
      antiloop.add(ms.it.id)
    })

    const further = (ms: DefinitionStack) => {
      if (onHold.has(ms.it.id)) {
        onHold.delete(ms.it.id)
        antiloop.delete(ms.it.id)
      }
      defToString(
        ms.it,
        amount * (ms.amount ?? 1),
        maxPad,
        antiloop,
        tabLevel + 1
      )
    }

    catalysts.forEach(further)
    usages.forEach(further)
  }

  function recipeSorter(a: Recipe, b: Recipe) {
    return sortCheapest(a, b) || reqPuritySumm(b) - reqPuritySumm(a)
  }

  function sortCheapest(a: Calculable, b: Calculable) {
    return b.purity - a.purity || a.complexity - b.complexity
  }

  function reqPuritySumm(a: Recipe): number {
    return puritySumm(a.inputs) + puritySumm(a.catalysts)
  }

  function puritySumm(arr?: IngredientStack[]): number {
    if (!arr) return 0
    return arr.reduce(
      (c, d) => c + Math.max(...[...d.it.matchedBy()].map((o) => o.purity)),
      0
    )
  }
}
