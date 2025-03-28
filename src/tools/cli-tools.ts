import type DefinitionStore from '../lib/items/DefinitionStore'
import type RecipeStore from '../lib/recipes/RecipeStore'

import fs from 'node:fs'
import process from 'node:process'
import chalk from 'chalk'
import cliProgress from 'cli-progress'

import numeral from 'numeral'
import Terminal from 'terminal-kit'

const { terminal: term } = Terminal

const sleep = () => new Promise(resolve => setTimeout(resolve, 1))

/* =============================================
=                   Helpers                   =
============================================= */
function loadText(filename: string): string {
  return fs.readFileSync(filename, 'utf8')
}
function logTask(text: string) {
  process.stdout.write(`-- ${text.padEnd(22)}`)
}
function logMore(text: string) {
  process.stdout.write(chalk.gray(text))
}
/* =============================================
=
============================================= */
interface TaskOptionsFiled<T> {
  'moreInfo'?: (info: {
    addedDefs: number
    addedRecs: number
    result: T extends Promise<any> ? Awaited<T> : T
  }) => string
  'textSource'?: string | null
  'action'?: (text: string) => T
  '🛑'?: string
  '⚠️'?: string
}

// type TaskOptions<T> = TaskOptionsBased<T> | TaskOptionsFiled<T>

const numFormat = (n: number) => numeral(n).format('+,')

export default class CLIHelper {
  bar?: cliProgress.SingleBar
  bars?: cliProgress.SingleBar[]
  multBarStop?: () => void

  constructor() {
    term(' ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
    term('\n')
  }

  print(...args: any[]) {
    this.write(...args)
    term('\n')
  }

  write(...args: any[]) {
    term(args.map(String).join(' '))
  }

  num(n: number): string {
    return chalk.green(numFormat(n))
  }

  startProgress(title: string | string[], total: number | number[]) {
    const commonOpts = {
      format: `${chalk.bold('{title}')} [${chalk.cyan('{bar}')}] ${chalk.gray(
        '{value}/{total}',
      )} | {task}`,
      hideCursor: true,
      stopOnComplete: true,
      linewrap: false,
    }

    if (Array.isArray(title) && Array.isArray(total)) {
      const multibar = new cliProgress.MultiBar(
        commonOpts,
        cliProgress.Presets.shades_classic,
      )
      this.multBarStop = () => multibar.stop()
      this.bars = title.map((t, i) => {
        const bar = multibar.create(total[i], 0)
        bar.start(total[i], 0, { task: '', title: t.padStart(15) })
        return bar
      })
    }
    else {
      this.bar = new cliProgress.SingleBar(
        commonOpts,
        cliProgress.Presets.shades_classic,
      )
      this.bar.start(total as number, 0, {
        task: '',
        title: String(title).padStart(15),
      })
    }
  }

  startItem(task: string) {
    this.bar?.update({ task })
  }

  progressIncrement(n?: number) {
    if (n)
      this.bar?.update(n)
    else this.bar?.increment()
  }

  createRunTask(definitionStore: DefinitionStore, recipesStore: RecipeStore) {
    return function runTask<T>(
      description: string,
      opts: TaskOptionsFiled<T>,
    ): T | undefined {
      if (description)
        logTask(description)

      const showWarn = (): any => {
        if (!opts['⚠️']) {
          console.error(`🛑  Error at task: ${opts['🛑']}`)
          throw new Error('Unable to complete task')
        }
        console.warn(`⚠️  ${opts['⚠️']}`)
      }

      let text
      if (opts.textSource) {
        try {
          text = loadText(opts.textSource)
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (err: unknown) {}
      }
      if (opts.textSource === null || (opts.textSource && !text))
        return showWarn()

      const oldDefs = definitionStore.size
      const oldRecs = recipesStore.size()
      const result = (opts.action ?? ((t: any) => t as T))(text as string)
      const isPromise = typeof (result as any)?.then === 'function'

      if (isPromise)
        (result as unknown as Promise<any>).then(r => finalize(r))
      else finalize()

      return result

      function finalize(promiseResult?: T) {
        // We have no result, show warn if result expected
        if ((isPromise && !promiseResult) || (!result))
          return showWarn()

        if (opts.moreInfo)
          logMoreInfo(promiseResult)

        if (description)
          process.stdout.write('\n')
      }

      function logMoreInfo(promiseResult?: any) {
        const info = {
          addedDefs: definitionStore.size - oldDefs,
          addedRecs: recipesStore.size() - oldRecs,
          result: promiseResult ?? result,
        }
        logMore(opts.moreInfo!(info))
      }
    }
  }

  async createMultibar(barsConfig: { [name: string]: { max: number, comment?: string } }) {
    this.startProgress(Object.keys(barsConfig), Object.values(barsConfig).map(o => o.max))
    await sleep()

    let i = 0
    const indexes = Object.fromEntries(Object.keys(barsConfig).map((b, i) => [b, i]))

    return {
      stop: async () => {
        this.multBarStop?.()
        await sleep()
      },
      update: async (bars: { [name: string]: [current?: number, total?: number] }) => {
        Object.entries(bars).forEach(([barName, [current, total]]) => {
          const payload = { task: barsConfig[barName].comment === undefined
            ? ''
            : `${barsConfig[barName].comment}: ${this.num(total ?? barsConfig[barName].max)}`,
          }
          if (current === undefined)
            this.bars?.[indexes[barName]].update(payload)
          else
            this.bars?.[indexes[barName]].update(current, payload)
        })

        if (++i % 1000 !== 0)
          return false

        await sleep()
        return true
      },
    }
  }
}
