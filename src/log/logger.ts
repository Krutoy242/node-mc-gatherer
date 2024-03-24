import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, parse } from 'node:path'

export interface CountableFunction {
  (...args: unknown[]): void
  count: number
}

export function createFileLogger(logFileName: string): CountableFunction {
  let firstCall = true
  const clearFileName = logFileName.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 60)
  const filePath = join('logs/', clearFileName)
  const fnc = function (...args: unknown[]) {
    if (firstCall) {
      firstCall = false
      mkdirSync(parse(filePath).dir, { recursive: true })
      writeFileSync(filePath, '')
    }

    appendFileSync(filePath, args.map(v => String(v)).join(' '))
    fnc.count = (fnc.count ?? 0) + 1
  } as CountableFunction
  return fnc
}
