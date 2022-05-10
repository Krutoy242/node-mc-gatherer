import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, parse } from 'path'

import _ from 'lodash'

import Calculable from '../lib/calc/Calculable'
import Definition from '../lib/items/Definition'
import Stack, { MicroStack } from '../lib/items/Stack'
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

    const catalysts = Stack.toMicroStacks(recipe.catalysts)
    const usages = Stack.toMicroStacks(recipe.inputs)

    playthrough.addCatalysts(catalysts)
    playthrough.addInputs(usages, amount)

    const combined = _.uniqBy([catalysts, usages].flat(), (ms) => ms.def.id)
    const maxPad = Math.max(...combined.map((ms) => ms.def.complexity_s.length))

    const onHold = new Set<string>()
    combined.forEach((ms) => {
      if (antiloop.has(ms.def.id)) return
      onHold.add(ms.def.id)
      antiloop.add(ms.def.id)
    })

    const further = (ms: MicroStack) => {
      if (onHold.has(ms.def.id)) {
        onHold.delete(ms.def.id)
        antiloop.delete(ms.def.id)
      }
      defToString(
        ms.def,
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

  function puritySumm(arr?: Stack[]): number {
    if (!arr) return 0
    return arr.reduce(
      (c, d) =>
        c + Math.max(...[...d.ingredient.matchedBy()].map((o) => o.purity)),
      0
    )
  }
}
