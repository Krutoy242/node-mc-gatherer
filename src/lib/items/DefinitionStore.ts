/* =============================================
=           Additionals Store
============================================= */

import _ from 'lodash'

import customRender from '../../custom/visual'
import { BlockToFluidMap } from '../../from/fluids'
import { NameMap } from '../../from/jeie/NameMap'
import { OredictMap } from '../../from/oredict'
import { createFileLogger } from '../../log/logger'

import Definition from './Definition'
import hardReplaceMap from './HardReplace'
import Ingredient from './Ingredient'
import { NBTMap, nbtMatch } from './NBT'

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

  lookById: (id: string) => Definition | undefined
  lookBased: (
    source: string,
    entry: string,
    meta?: string,
    sNbt?: string
  ) => Definition | undefined

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
    this.lookBased = (source, entry, meta, sNbt) => {
      return this.tree[source]?.[entry]?.[Definition.actualMeta(meta) ?? '']?.[
        sNbt ?? ''
      ]
    }
    this.lookById = (id) => this.lookBased(...getBaseFromId(id))

    this.getBased = (source, entry, meta, sNbt) => {
      const actualMeta = Definition.actualMeta(meta)
      if (this.locked) {
        const found = this.lookBased(source, entry, meta, sNbt)
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
      return this.getBased(...getBaseFromId(id))
    }

    function getBaseFromId(
      id: string
    ): [source: string, entry: string, meta?: string, sNbt?: string] {
      const actualId = hardReplaceMap[id] ?? id
      const splitted = actualId.split(':')
      if (splitted.length <= 1) throw new Error(`Cannot get id: ${actualId}`)

      // Ore can content : in name
      if (splitted[0] === 'ore') return ['ore', splitted.slice(1).join(':')]
      return [
        splitted[0],
        splitted[1],
        splitted[2],
        splitted.slice(3).join(':'),
      ]
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

  toString() {
    return [...this.iterate()]
      .filter((def) => def.purity > 0)
      .sort((a, b) => a.complexity - b.complexity)
      .map((d) => d.toString())
      .join('\n')
  }

  async assignVisuals(nameMap?: NameMap, blockToFluidMap?: BlockToFluidMap) {
    const log = {
      noViewBox: createFileLogger('noViewBox.log'),
      noDisplay: createFileLogger('noDisplay.log'),
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    // Assign defined
    for (const def of this.iterate()) {
      await assignVisual(def, true)
    }
    for (const def of this.iterate()) {
      await assignVisual(def)
    }

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

  *matchedBy(ingr: Ingredient): IterableIterator<Definition> {
    if (ingr.hasMatchedCache()) return yield* ingr.matchedBy()
    const arr: Definition[] = []

    for (const def of ingr.items) {
      for (const d of this.matchedByDef(def)) {
        arr.push(d)
        yield d
      }
    }
    ingr.setMatchedCache(arr)
  }

  private *matchedByDef(def?: Definition): IterableIterator<Definition> {
    if (!def) return
    if (!this.oreDict)
      throw new Error('OreDict must be intitialized before iteration')

    if (def.source === 'ore') {
      const oreList = this.oreDict[def.entry]
      if (!oreList) {
        throw new Error(`This ore is empty: ${def.entry}`)
      }

      for (const oreDef of oreList) {
        yield* this.matchedByNonOre(oreDef)
      }
    } else {
      yield* this.matchedByNonOre(def)
    }
  }

  private *matchedByNonOre(def: Definition): IterableIterator<Definition> {
    if (def.meta === '32767' || def.meta === '*') {
      const se = this.tree[def.source][def.entry]
      for (const meta in se) {
        if (meta === '32767' || meta === '*') continue
        yield* Object.values(se[meta])
      }
    } else {
      const sNbtMap = this.tree[def.source][def.entry][def.meta ?? '']
      if (!def.sNbt) {
        for (const sNbt in sNbtMap) {
          yield sNbtMap[sNbt]
        }
      } else {
        if (sNbtMap['*']) yield sNbtMap['*']
        yield* this.matchedByNbt(def, sNbtMap)
      }
    }
  }

  private *matchedByNbt(
    def: Definition,
    sNbtMap: { [sNbt: string]: Definition }
  ): IterableIterator<Definition> {
    // Empty nbt, any nbt match
    if (!def.nbt) return yield* Object.values(sNbtMap)

    // Wildcarded nbt - any except itself match
    if (def.nbt === '*') {
      for (const sNbt in sNbtMap) {
        const d = sNbtMap[sNbt]
        if (d !== def) yield d
      }
    }

    const nbt = def.nbt as NBTMap

    for (const sNbt in sNbtMap) {
      const d = sNbtMap[sNbt]

      // Wildcarded nbt or same def
      if (d.nbt === '*' || sNbt === def.sNbt || def === d) {
        yield d
        continue
      }

      if (nbtMatch(nbt, d.nbt)) yield d
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
