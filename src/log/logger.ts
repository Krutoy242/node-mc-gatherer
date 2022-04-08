import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, parse } from 'path'

import Definition from '../lib/items/Definition'
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
    appendFileSync(filePath, args.map((v) => String(v)).join(' '))
    fnc.count = (fnc.count ?? 0) + 1
  } as CountableFunction
  return fnc
}

export function logTreeTo(def: Definition, recipeStore: Recipe[]): string {
  return defToString(def).join('\n')

  function defToString(
    def: Definition,
    antiloop = new Set<string>(),
    tabLevel = 0
  ): string[] {
    if (antiloop.has(def.id)) return []
    antiloop.add(def.id)
    const lines: string[] = []
    const tab = '  '.repeat(tabLevel)
    lines.push(tab + def.toString())

    if (def.recipes) {
      const recs = [...def.recipes]
        .map((rIndex) => recipeStore[rIndex])
        .sort((a, b) => b.purity - a.purity || a.complexity - b.complexity)
      lines.push(
        ...recs[0]
          .toString()
          .split('\n')
          .map((s) => tab + s)
      )
      ;[...(recs[0].catalysts ?? []), ...(recs[0].inputs ?? [])]?.forEach((o) =>
        lines.push(
          ...defToString(o.definition, antiloop, tabLevel + 1).map(
            (s) => tab + s
          )
        )
      )
    }

    return lines
  }
}
