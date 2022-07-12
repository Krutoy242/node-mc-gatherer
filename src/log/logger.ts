import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, parse } from 'path'

import _ from 'lodash'

import Calculable from '../api/Calculable'
import IngredientStack from '../api/IngredientStack'
import Playthrough from '../api/Playthrough'
import Definition from '../lib/items/Definition'
import { DefinitionStack } from '../lib/items/DefinitionStack'
import Recipe from '../lib/recipes/Recipe'

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
