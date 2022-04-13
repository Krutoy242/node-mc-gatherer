/* =============================================
=           Additionals Store
============================================= */

import { IType, iTypesMap } from '../../from/jeie/IType'

import Definition from './Definition'
import hardReplaceMap from './HardReplace'

export interface ExportDefinition {
  viewBox?: string
  display?: string
  recipes?: number[]
}

export default class DefinitionStore {
  size = 0

  private tree: {
    [source: string]: {
      [entry: string]: {
        [meta: string]: {
          [sNbt: string]: Definition
        }
      }
    }
  } = {};

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

  getById(id: string): Definition {
    const actualId = hardReplaceMap[id] ?? id
    const splitted = actualId.split(':')
    if (splitted.length <= 1) throw new Error(`Cannot get id: ${actualId}`)

    return this.getBased(
      splitted[0],
      splitted[1],
      splitted[2],
      splitted.slice(3).join(':')
    )
  }

  getBased(
    source: string,
    entry: string,
    meta?: string,
    sNbt?: string
  ): Definition {
    const actualMeta = Definition.actualMeta(meta)
    return ((((this.tree[source] ??= {})[entry] ??= {})[actualMeta ?? ''] ??=
      {})[sNbt ?? ''] ??=
      (this.size++, new Definition(source, entry, actualMeta, sNbt)))
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
}
