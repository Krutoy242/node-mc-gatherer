import { Base } from './'
/* =============================================
=           Additionals Store
============================================= */

export class Tree<T> {
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

  /** Is tree locked and no new entryes could be added */
  private locked = false

  constructor(
    NewItem: (id: string, ...base: Base) => T,
    hardReplaceMap?: Record<string, string>
  ) {
    function baseFromId(id: string): Base {
      const actualId = hardReplaceMap?.[id] ?? id
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

    this.lookBased = (source, entry, meta, sNbt) => {
      return this.tree[source]?.[entry]?.[Tree.actualMeta(meta) ?? '']?.[
        sNbt ?? ''
      ]
    }
    this.lookById = (id) => this.lookBased(...baseFromId(id))

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

    this.getById = (id) => this.getBased(...baseFromId(id))
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
}
