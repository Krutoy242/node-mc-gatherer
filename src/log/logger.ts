import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, parse } from 'path'

import _ from 'lodash'

import Calculable from '../lib/calc/Calculable'
import Definition from '../lib/items/Definition'
import Stack from '../lib/items/Stack'
import Recipe from '../lib/recipes/Recipe'

export interface CountableFunction {
  (...args: unknown[]): void
  count: number
}

export function createFileLogger(logFileName: string): CountableFunction {
  mkdirSync(parse('logs/' + logFileName).dir, { recursive: true })
  const filePath = join('logs/', logFileName)
  writeFileSync(filePath, '')
  const fnc = function (...args: unknown[]) {
    appendFileSync(
      filePath,
      args.map((v) => String(v)).join(' ') /* (e) => {
      throw e
    } */
    )
    fnc.count = (fnc.count ?? 0) + 1
  } as CountableFunction
  return fnc
}

export function logTreeTo(
  def: Definition,
  recipeStore: Recipe[],
  write: (str: string) => void
) {
  const writeLn = (s: string) => write(s + '\n')
  defToString(def)

  function defToString(
    def: Definition,
    antiloop = new Set<string>(),
    tabLevel = 0
  ) {
    if (antiloop.has(def.id)) return
    antiloop.add(def.id)

    const tab = '  '.repeat(tabLevel)
    writeLn(tab + def.toString())

    if (def.recipes) {
      const mainRecipe = [...def.recipes]
        .map((rIndex) => recipeStore[rIndex])
        .sort(recipeSorter)[0]

      mainRecipe
        .toString()
        .split('\n')
        .forEach((line) => writeLn(tab + line))

      mainRecipe.requirments.forEach((stack) => {
        const cheapest = stack.ingredient.items.sort(getCheapest)[0]
        defToString(cheapest, antiloop, tabLevel + 1)
      })
    }
  }

  function recipeSorter(a: Recipe, b: Recipe) {
    return getCheapest(a, b) || reqPuritySumm(b) - reqPuritySumm(a)
  }

  function getCheapest(a: Calculable, b: Calculable) {
    return b.purity - a.purity || a.complexity - b.complexity
  }

  function reqPuritySumm(a: Recipe): number {
    return summ(a.inputs) + summ(a.catalysts)
  }
}

function summ(arr?: Stack[]): number {
  if (!arr) return 0
  return arr.reduce(
    (c, d) => c + Math.max(...d.ingredient.items.map((o) => o.purity)),
    0
  )
}
