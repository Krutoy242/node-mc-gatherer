import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

export interface CountableFunction {
  (...args: unknown[]): void
  count: number
}

export function createFileLogger(logFileName: string): CountableFunction {
  mkdirSync('logs/', { recursive: true })
  const filePath = join('logs/', logFileName)
  writeFileSync(filePath, '')
  const fnc = <CountableFunction>function (...args: unknown[]) {
    appendFileSync(filePath, args.map((v) => String(v)).join(' '))
    fnc.count = (fnc.count ?? 0) + 1
  }
  return fnc
}
