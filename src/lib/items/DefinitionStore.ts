/* eslint-disable guard-for-in */
/* =============================================
=           Additionals Store
============================================= */

import customRender from '../../custom/visual'
import { NameMap } from '../../from/jeie/NameMap'
import { OredictMap } from '../../from/oredict'
import { createFileLogger } from '../../log/logger'

import Definition from './Definition'
import hardReplaceMap from './HardReplace'
import Ingredient from './Ingredient'

export interface ExportDefinition {
  viewBox?: string
  display?: string
  recipes?: number[]
}

export default class DefinitionStore {
  locked = false
  size = 0

  getById: (id: string) => Definition
  getBased: (
    source: string,
    entry: string,
    meta?: string,
    sNbt?: string
  ) => Definition

  private ingrCache = new Map<Ingredient, Definition[]>()
  private oreDict?: { [oreName: string]: Definition[] }

  private tree: {
    [source: string]: {
      [entry: string]: {
        [meta: string]: {
          [sNbt: string]: Definition
        }
      }
    }
  } = {}

  constructor() {
    this.getBased = (source, entry, meta, sNbt) => {
      const actualMeta = Definition.actualMeta(meta)
      if (this.locked) {
        const found = this.tree[source][entry][actualMeta ?? ''][sNbt ?? '']
        if (!found) {
          throw new Error('Trying to create new item in Locked mode')
        }
        return found
      }
      return ((((this.tree[source] ??= {})[entry] ??= {})[actualMeta ?? ''] ??=
        {})[sNbt ?? ''] ??=
        (this.size++, new Definition(source, entry, actualMeta, sNbt)))
    }

    this.getById = (id) => {
      const actualId = hardReplaceMap[id] ?? id
      const splitted = actualId.split(':')
      if (splitted.length <= 1) throw new Error(`Cannot get id: ${actualId}`)

      // Ore can content : in name
      if (splitted[0] === 'ore')
        return this.getBased('ore', splitted.slice(1).join(':'))

      return this.getBased(
        splitted[0],
        splitted[1],
        splitted[2],
        splitted.slice(3).join(':')
      )
    }
  }

  lock() {
    this.locked = true
  }

  addOreDict(oreDict: OredictMap) {
    this.oreDict = Object.fromEntries(
      Object.entries(oreDict).map(([k, v]) => [
        k,
        v.map((id) => this.getById(id)),
      ])
    )
  }

  *iterate(): IterableIterator<Definition> {
    for (const o1 of Object.values(this.tree)) {
      for (const o2 of Object.values(o1)) {
        for (const o3 of Object.values(o2)) {
          for (const def of Object.values(o3)) {
            yield def
          }
        }
      }
    }
  }

  export() {
    const out: { [id: string]: ExportDefinition } = {}
    for (const def of this.iterate()) {
      out[def.id] = {
        viewBox: def.viewBox,
        display: def.display,
        recipes: def.recipes && [...def.recipes],
      }
    }
    return out
  }

  toString() {
    return [...this.iterate()]
      .filter((def) => def.purity > 0)
      .sort((a, b) => a.complexity - b.complexity)
      .map((d) => d.toString())
      .join('\n')
  }

  assignVisuals(nameMap: NameMap) {
    const log = {
      noViewBox: createFileLogger('noViewBox.log'),
      noDisplay: createFileLogger('noDisplay.log'),
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    for (const def of this.iterate()) {
      assignVisual(def)
    }

    return { noViewBox: log.noViewBox.count, noDisplay: log.noDisplay.count }

    function assignVisual(def: Definition) {
      if (def.viewBox && def.display) return

      const { source, entry, meta, sNbt } = def
      const attempts: () => IterableIterator<{
        display?: string
        viewBox?: string
      }> = function* () {
        if (sNbt) yield self.getBased(source, entry, meta)
        if (meta !== undefined && meta !== '0')
          yield self.getBased(source, entry)
        yield {
          display:
            nameMap[
              sNbt
                ? `${source}:${entry}:${meta ?? '0'}:${unsignedHash(sNbt)}`
                : def.id
            ]?.en_us,
        }
        yield customRender(source, entry, meta, sNbt, (id: string) =>
          self.getById(id)
        )
      }

      for (const defOther of attempts()) {
        if (def.viewBox && def.display) return
        if (defOther === def) continue
        def.viewBox ??= defOther.viewBox
        def.display ??= defOther.display
      }

      if (!def.display) {
        def.display = `[${def.id}]`
        log.noDisplay(def.id + '\n')
      }

      if (!def.viewBox) {
        def.viewBox = self.getBased('openblocks', 'dev_null')?.viewBox
        log.noViewBox(def.id + '\n')
      }
    }
  }

  *matchedBy(ingr: Ingredient): IterableIterator<Definition> {
    const found = this.ingrCache.get(ingr)
    if (found) {
      for (const d of found) {
        yield d
      }
      return
    }
    const arr: Definition[] = []

    if (!this.oreDict)
      throw new Error('OreDict must be intitialized before iteration')

    for (const def of ingr.items) {
      if (def.source === 'ore') {
        const oreList = this.oreDict[def.entry]
        if (!oreList) {
          throw new Error(`This ore is empty: ${def.entry}`)
        }

        for (const oreDef of oreList) {
          for (const d of this.matchedByNonOre(oreDef)) {
            arr.push(d)
            yield d
          }
        }
      } else {
        for (const d of this.matchedByNonOre(def)) {
          arr.push(d)
          yield d
        }
      }
    }
    this.ingrCache.set(ingr, arr)
  }

  private *matchedByNonOre(def: Definition): IterableIterator<Definition> {
    if (def.meta === '32767' || def.meta === '*') {
      const se = this.tree[def.source][def.entry]
      for (const meta in se) {
        if (meta === '32767' || meta === '*') continue
        const sem = se[meta]
        for (const sNbt in sem) {
          yield sem[sNbt]
        }
      }
    } else {
      const metaMap = this.tree[def.source][def.entry][def.meta ?? '']
      if (!def.sNbt) {
        for (const sNbt in metaMap) {
          yield metaMap[sNbt]
        }
      } else {
        if (metaMap['*']) yield metaMap['*']
        yield def
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
