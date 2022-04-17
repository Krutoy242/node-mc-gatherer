import fs from 'fs'

import chalk from 'chalk'
import cliProgress from 'cli-progress'
import numeral from 'numeral'
import { terminal as term, Terminal } from 'terminal-kit'

import DefinitionStore from '../lib/items/DefinitionStore'
import RecipeStore from '../lib/recipes/RecipeStore'

/* =============================================
=                   Helpers                   =
============================================= */
function loadText(filename: string): string {
  return fs.readFileSync(filename, 'utf8')
}
function logTask(text: string) {
  process.stdout.write('-- ' + text.padEnd(22))
}
function logMore(text: string) {
  process.stdout.write(chalk.gray(text))
}
/* =============================================
=
============================================= */

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
        '{value}/{total}'
      )} | {task}`,
      hideCursor: true,
      stopOnComplete: true,
      linewrap: false,
    }

    if (Array.isArray(title) && Array.isArray(total)) {
      const multibar = new cliProgress.MultiBar(
        commonOpts,
        cliProgress.Presets.shades_classic
      )
      this.multBarStop = () => multibar.stop()
      this.bars = title.map((t, i) => {
        const bar = multibar.create(total[i], 0)
        bar.start(total[i], 0, { task: '', title: t.padStart(15) })
        return bar
      })
    } else {
      this.bar = new cliProgress.SingleBar(
        commonOpts,
        cliProgress.Presets.shades_classic
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
    if (n) this.bar?.update(n)
    else this.bar?.increment()
  }

  createRunTask(definitionStore: DefinitionStore, recipesStore: RecipeStore) {
    return function runTask<T>(opts: {
      description?: string
      moreInfo?: (info: {
        addedDefs: number
        addedRecs: number
        result: T
      }) => string
      textSource?: string
      action?: (text: string) => T
      fileError?: string
    }): T {
      if (opts.description) logTask(opts.description)
      let text = ''
      if (opts.textSource)
        try {
          text = loadText(opts.textSource)
        } catch (err: unknown) {
          console.error(`🛑  Error at task: ${opts.fileError}`)
          throw new Error('Unable to complete task')
        }

      const oldDefs = definitionStore.size
      const oldRecs = recipesStore.size()
      const result = (opts.action ?? ((t: any) => t as T))(text)
      const isPromise = typeof (result as any)?.then === 'function'

      if (opts.moreInfo) {
        if (isPromise)
          (result as unknown as Promise<any>).then((data) => logMoreInfo(data))
        else logMoreInfo()
      }

      if (opts.description) {
        if (isPromise) {
          ;(result as any).then(() => process.stdout.write('\n'))
        } else process.stdout.write('\n')
      }

      return result

      function logMoreInfo(data?: any) {
        const info = {
          addedDefs: definitionStore.size - oldDefs,
          addedRecs: recipesStore.size() - oldRecs,
          result: data ?? result,
        }
        logMore(opts.moreInfo!(info))
      }
    }
  }
}
