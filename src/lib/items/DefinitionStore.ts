/* =============================================
=           Additionals Store
============================================= */

import _ from 'lodash'

import { Ingredient, Tree } from '../../api'
import { CSVFile } from '../../api/csv'
import customRender from '../../custom/visual'
import { BlockToFluidMap } from '../../from/fluids'
import { NameMap } from '../../from/jeie/NameMap'
import { createFileLogger } from '../../log/logger'
import { getCSVHeaders } from '../../tools/CsvDecorators'

import Definition from './Definition'

export default class DefinitionStore
  extends Tree<Definition>
  implements CSVFile
{
  csv() {
    const defsCsv = [...this]
    return (
      getCSVHeaders(defsCsv[0]) +
      '\n' +
      defsCsv
        .sort((a, b) => b.complexity - a.complexity)
        .map((d) => d.csv())
        .join('\n')
    )
  }

  async assignVisuals(nameMap?: NameMap, blockToFluidMap?: BlockToFluidMap) {
    const log = {
      noViewBox: createFileLogger('noViewBox.log'),
      noDisplay: createFileLogger('noDisplay.log'),
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    // Assign defined
    for (const def of this) await assignVisual(def, true)
    for (const def of this) await assignVisual(def)

    return { noViewBox: log.noViewBox.count, noDisplay: log.noDisplay.count }

    async function assignVisual(def: Definition, firstRun = false) {
      const fine = () => def.viewBox && def.display
      if (fine()) return

      const { source, entry, meta, sNbt } = def
      const jeieId = sNbt
        ? `${source}:${entry}:${meta ?? '0'}:${unsignedHash(sNbt)}`
        : def.id
      const jeieEntry = nameMap?.[jeieId]
      if (jeieEntry) def.tooltips = jeieEntry.tooltips

      if (firstRun || fine()) return

      const attempts: () => IterableIterator<
        | {
            display?: string
            viewBox?: string
          }
        | undefined
      > = function* () {
        if (sNbt) yield* self.matchedByDef(self.lookBased(source, entry, meta))
        if (meta === '*' || entry === 'ore') yield* self.matchedByDef(def)
        if (meta !== undefined && meta !== '0')
          yield self.lookBased(source, entry)
        if (blockToFluidMap && meta === '0' && !sNbt) {
          const id = blockToFluidMap[def.id]
          if (id) yield self.lookById(id)
        }
        yield {
          display: jeieEntry?.name,
        }
        yield customRender(source, entry, meta, sNbt, self.getById)
        yield* self.matchedByDef(def)
      }

      for (const defOther of attempts()) {
        if (fine()) return
        if (!defOther || defOther === def) continue
        def.viewBox ??= defOther.viewBox
        def.display ??= defOther.display
      }

      if (!def.display) {
        // def.display = `[${def.id}]`
        log.noDisplay(def.id + '\n')
      }

      if (!def.viewBox) {
        def.viewBox = self.getBased('openblocks', 'dev_null')?.viewBox
        log.noViewBox(def.id + '\n')
      }
    }
  }
}

;(String.prototype as any).hashCode = function () {
  let hash = 0
  let i
  let chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function unsignedHash(str: string) {
  let number = (str as any).hashCode()
  if (number < 0) {
    number = 0xffffffff + number + 1
  }

  return number.toString(16)
}
