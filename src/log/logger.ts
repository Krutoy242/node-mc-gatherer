import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, parse } from 'path'

import _ from 'lodash'

import Calculable from '../lib/calc/Calculable'
import Definition from '../lib/items/Definition'
import Stack from '../lib/items/Stack'
import Recipe from '../lib/recipes/Recipe'
import RecipeStore from '../lib/recipes/RecipeStore'

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
  defToString(def)

  function defToString(
    def: Definition,
    complexityPad = 1,
    antiloop = new Set<string>(),
    tabLevel = 0
  ) {
    if (antiloop.has(def.id)) return
    antiloop.add(def.id)

    const tab = '  '.repeat(tabLevel)
    writeLn(tab + def.toString({ complexityPad }))

    if (!def.recipes) return

    const mainRecipe = def.mainRecipe ?? [...def.recipes].sort(recipeSorter)[0]

    if (!mainRecipe) return

    mainRecipe
      .toString()
      .split('\n')
      .forEach((line) => writeLn(tab + '  ' + line))

    const [cheapest, maxPad] = getCheapestArr(mainRecipe)

    const onHold = new Set<string>()
    cheapest.forEach((def) => {
      if (antiloop.has(def.id)) return
      onHold.add(def.id)
      antiloop.add(def.id)
    })

    cheapest.forEach((def) => {
      if (onHold.has(def.id)) antiloop.delete(def.id)
      defToString(def, maxPad, antiloop, tabLevel + 1)
    })
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

  function getCheapestArr(main: Recipe) {
    let maxPad = 0
    const cheapestArr = [main.catalysts, main.inputs]
      .filter((s): s is Stack[] => !!s)
      .map((r) =>
        r
          .map((s) => {
            const d = getCheapest(s)
            maxPad = Math.max(maxPad, d.complexity_s.length)
            return d
          })
          .sort(expensiveSort)
      )
      .flat()
    return [[...new Set(cheapestArr)], maxPad] as const
  }

  function getCheapest(stack: Stack): Definition {
    return [...stack.ingredient.matchedBy()].sort(cheapestSort)[0]
  }

  function cheapestSort(a: Calculable, b: Calculable) {
    return b.purity - a.purity || a.complexity - b.complexity
  }

  function expensiveSort(a: Calculable, b: Calculable) {
    return b.complexity - a.complexity
  }
}
