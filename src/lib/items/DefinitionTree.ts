/* =============================================
=           Additionals Store
============================================= */

import Definition from './Definition'

type Base = [source: string, entry: string, meta?: string, sNbt?: string]

export default class DefinitionTree {
  size = 0

  lookById: (id: string) => Definition | undefined
  lookBased: (...args: Base) => Definition | undefined

  getById: (id: string) => Definition
  getBased: (...args: Base) => Definition

  protected tree: {
    [source: string]: {
      [entry: string]: {
        [meta: string]: {
          [sNbt: string]: Definition
        }
      }
    }
  } = {}

  /** Is tree locked and no new entryes could be added */
  private locked = false

  constructor() {
    this.lookBased = (source, entry, meta, sNbt) => {
      return this.tree[source]?.[entry]?.[Definition.actualMeta(meta) ?? '']?.[
        sNbt ?? ''
      ]
    }
    this.lookById = (id) => this.lookBased(...Definition.baseFromId(id))

    this.getBased = (source, entry, meta, sNbt) => {
      if (this.locked) {
        const found = this.lookBased(source, entry, meta, sNbt)
        if (!found) {
          throw new Error('Trying to create new item in Locked mode')
        }
        return found
      }
      const actualMeta = Definition.actualMeta(meta)
      return ((((this.tree[source] ??= {})[entry] ??= {})[actualMeta ?? ''] ??=
        {})[sNbt ?? ''] ??=
        (this.size++, new Definition(source, entry, actualMeta, sNbt)))
    }

    this.getById = (id) => {
      return this.getBased(...Definition.baseFromId(id))
    }
  }

  /**
   * Lock tree - no more items could be added
   */
  lock() {
    this.locked = true
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
}
