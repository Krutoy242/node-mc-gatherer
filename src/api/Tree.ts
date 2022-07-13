import { NBT, nbtMatch, parseSNbt } from './NBT'

import { Base, Based, Identified, Ingredient } from './'
/* =============================================
============================================= */

const nbtCache: { [len: number]: { [sNbt: string]: NBT | null } } = {}
function getNbt(sNbt?: string) {
  if (!sNbt) return
  return ((nbtCache[sNbt.length] ??= {})[sNbt] ??= parseSNbt(sNbt))
}

/* =============================================
============================================= */

export class Tree<T extends Identified & Based> {
  static actualMeta(meta?: string): string | undefined {
    // eslint-disable-next-line eqeqeq
    return meta == '32767' ? '*' : meta
  }

  static baseToId: (...base: Base) => string = (source, entry, meta, sNbt) => {
    const m = Tree.actualMeta(meta)
    return `${source}:${entry}${m !== undefined ? ':' + m : ''}${
      sNbt ? ':' + sNbt : ''
    }`
  }

  static baseFromId(id: string, hardReplaceMap?: Record<string, string>): Base {
    const actualId = hardReplaceMap?.[id] ?? id
    const splitted = actualId.split(':')
    if (splitted.length <= 1) throw new Error(`Cannot get id: ${actualId}`)

    // Ore can content : in name
    if (splitted[0] === 'ore') return ['ore', splitted.slice(1).join(':')]

    return [splitted[0], splitted[1], splitted[2], splitted.slice(3).join(':')]
  }

  size = 0

  lookById: (id: string) => T | undefined
  lookBased: (...args: Base) => T | undefined

  getById: (id: string) => T
  getBased: (...args: [...base: Base, id?: string]) => T

  protected tree: {
    [source: string]: {
      [entry: string]: {
        [meta: string]: {
          [sNbt: string]: T
        }
      }
    }
  } = {}

  private oreDict?: { [oreName: string]: T[] }

  /** Is tree locked and no new entryes could be added */
  private locked = false

  constructor(
    NewItem: (id: string, ...base: Base) => T,
    hardReplaceMap?: Record<string, string>
  ) {
    this.lookBased = (source, entry, meta, sNbt) => {
      return this.tree[source]?.[entry]?.[Tree.actualMeta(meta) ?? '']?.[
        sNbt ?? ''
      ]
    }
    this.lookById = (id) =>
      this.lookBased(...Tree.baseFromId(id, hardReplaceMap))

    this.getBased = (source, entry, meta, sNbt, id) => {
      if (this.locked) {
        const found = this.lookBased(source, entry, meta, sNbt)
        if (!found) throw new Error('Trying to create new item in Locked mode')
        return found
      }

      const actualMeta = Tree.actualMeta(meta)

      return ((((this.tree[source] ??= {})[entry] ??= {})[actualMeta ?? ''] ??=
        {})[sNbt ?? ''] ??=
        (this.size++,
        NewItem(
          id ?? Tree.baseToId(source, entry, meta, sNbt),
          source,
          entry,
          actualMeta,
          sNbt
        )))
    }

    this.getById = (id) => this.getBased(...Tree.baseFromId(id, hardReplaceMap))
  }

  addOreDict(oreDict: { [oreName: string]: string[] }) {
    this.oreDict = Object.fromEntries(
      Object.entries(oreDict).map(([k, v]) => [
        k,
        v.map((id) => this.getById(id)),
      ])
    )
  }

  /**
   * Lock tree - no more items could be added
   */
  lock() {
    this.locked = true
  }

  *[Symbol.iterator](): IterableIterator<T> {
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

  *matchedBy(ingr: Ingredient<T>): IterableIterator<T> {
    if (ingr.hasMatchedCache()) return yield* ingr.matchedBy()
    const arr: T[] = []
    ingr.setMatchedCache(arr)

    for (const def of ingr.items) {
      for (const d of this.matchedByDef(def)) {
        arr.push(d)
        yield d
      }
    }
  }

  protected *matchedByDef(def?: T): IterableIterator<T> {
    if (!def) return
    if (!this.oreDict)
      throw new Error('OreDict must be intitialized before iteration')

    if (def.source === 'ore') {
      const oreList = this.oreDict[def.entry]
      if (!oreList) {
        console.warn(`This ore is empty: ${def.entry}`)
        return yield def
      }

      for (const oreDef of oreList) {
        yield* this.matchedByNonOre(oreDef)
      }
    } else {
      yield* this.matchedByNonOre(def)
    }
  }

  private *matchedByNonOre(def: T): IterableIterator<T> {
    if (isWildcard(def.meta)) {
      const se = this.tree[def.source][def.entry]
      for (const meta in se) {
        if (isWildcard(meta)) continue
        yield* Object.values(se[meta])
      }
    } else {
      if (def.source === undefined || def.entry === undefined) {
        throw new Error('Item parser malfunction for: ' + def.id)
      }
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
    def: T,
    sNbtMap: { [sNbt: string]: T }
  ): IterableIterator<T> {
    const defNbt = getNbt(def.sNbt)
    // Empty nbt, any nbt match
    if (!defNbt) return yield* Object.values(sNbtMap)

    // Wildcarded nbt - any except itself match
    if (defNbt === '*') {
      for (const sNbt in sNbtMap) {
        const d = sNbtMap[sNbt]
        if (d !== def) yield d
      }
      return
    }

    for (const sNbt in sNbtMap) {
      const d = sNbtMap[sNbt]
      const dNbt = getNbt(d.sNbt)

      // Wildcarded nbt or same def
      if (dNbt === '*' || sNbt === def.sNbt || def === d) {
        yield d
        continue
      }

      if (nbtMatch(defNbt, dNbt)) yield d
    }
  }
}

function isWildcard(v?: number | string): boolean {
  // eslint-disable-next-line eqeqeq
  return v == 32767 || v === '*'
}
