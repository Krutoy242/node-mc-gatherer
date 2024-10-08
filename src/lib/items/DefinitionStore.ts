/* =============================================
=           Additionals Store
============================================= */

import type { NameMap } from 'mc-jeiexporter/build/NameMap'

import type { BaseVisible } from '../../api'
import type { BlockToFluidMap } from '../../from/fluids'
import { getIcon } from 'mc-icons'
import { Tree } from '../../api/Tree'
import customRender from '../../custom/visual'
import { createFileLogger } from '../../log/logger'

import { getCsvLine, getHeaders } from '../../tools/CsvDecorators'
import Definition from './Definition'

export default class DefinitionStore
  extends Tree<Definition> {
  csv() {
    return (
      `${getHeaders(Definition)
      }\n${
        [...this]
          .sort((a, b) => b.complexity - a.complexity)
          .map(d => getCsvLine(d))
          .join('\n')}`
    )
  }

  async assignVisuals(nameMap: NameMap | undefined, blockToFluidMap?: BlockToFluidMap) {
    const log = {
      noImgsrc: createFileLogger('noImgsrc.log'),
      noDisplay: createFileLogger('noDisplay.log'),
    }

    // eslint-disable-next-line ts/no-this-alias
    const self = this

    // Assign defined
    for (const def of this) await assignVisual(def, true)
    for (const def of this) await assignVisual(def)

    return { noImgsrc: log.noImgsrc.count, noDisplay: log.noDisplay.count }

    async function assignVisual(def: Definition, firstRun = false) {
      const fine = () => def.imgsrc && def.display
      if (fine())
        return

      const { source, entry, meta, sNbt } = def

      // Find tooltips
      const jeieEntry = nameMap?.[`${source}:${entry}${(meta || sNbt) ? `:${meta ?? 0}` : ''}${sNbt ? `:${unsignedHash(sNbt)}` : ''}`]
      if (jeieEntry)
        def.tooltips = jeieEntry.tooltips

      function* attempts(): IterableIterator<BaseVisible | undefined> {
        yield {
          imgsrc: getIcon([source, entry, Number(meta), sNbt]),
          display: jeieEntry?.name,
        }
        if (source === 'placeholder')
          yield { display: `«${entry[0].toLocaleUpperCase()}${entry.slice(1)}${meta ? `: ${meta}` : ''}»` }
        if (source === 'entity') {
          yield {
            imgsrc: getIcon(['draconicevolution', 'mob_soul', 0, `{EntityName:"${entry}:${meta}"}`]),
            display: nameMap?.[
              `draconicevolution:mob_soul:0:${unsignedHash(`{EntityName:"${entry}:${meta}"}`)}`
            ]?.name?.replace(/ Soul$/i, ''),
          }
        }
        if (sNbt)
          yield * self.matchedByDef(self.lookBased(source, entry, meta))
        if (meta === '*' || entry === 'ore')
          yield * self.matchedByDef(def)
        if (meta !== undefined && meta !== '0')
          yield self.lookBased(source, entry)
        if (blockToFluidMap && meta === '0' && !sNbt) {
          const id = blockToFluidMap[def.id]
          if (id)
            yield self.lookById(id)
        }
        yield customRender(source, entry, meta, sNbt, self.getById)
        yield * self.matchedByDef(def)
      }

      for (const defOther of attempts()) {
        if (!defOther || defOther === def)
          continue
        def.imgsrc ??= defOther.imgsrc
        def.display ??= defOther.display
        if (firstRun || fine())
          return
      }

      if (!def.display) {
        def.display = `<${def.id}>`
        log.noDisplay(`${def.id}\n`)
      }

      if (!def.imgsrc) {
        def.imgsrc = self.getBased('openblocks', 'dev_null')?.imgsrc
        log.noImgsrc(`${def.id}\n`)
      }
    }
  }
}

(String.prototype as any).hashCode = function () {
  let hash = 0
  let i
  let chr
  if (this.length === 0)
    return hash
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function unsignedHash(str: string) {
  let number = (str as any).hashCode()
  if (number < 0)
    number = 0xFFFFFFFF + number + 1

  return number.toString(16)
}
