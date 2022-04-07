/* =============================================
=           Additionals Store
============================================= */

import { ITypes } from '../from/JEIExporterTypes'

import Definition from './Definition'

export interface ExportDefinition {
  viewBox?: string
  display?: string
  recipes?: number[]
}

export interface DefinitionStoreMap {
  [id: string]: Definition
}

export default class DefinitionStore {
  store: DefinitionStoreMap = {}

  get(id: string, iType: ITypes = 'item'): Definition {
    return (this.store[id] ??= new Definition(id, iType))
  }

  export() {
    const out: { [id: string]: ExportDefinition } = {}
    for (const [key, o] of Object.entries(this.store)) {
      out[key] = {
        viewBox: o.viewBox,
        display: o.display,
        recipes: o.recipes && [...o.recipes],
      }
    }
    return out
  }

  toString() {
    return Object.values(this.store)
      .filter((def) => def.purity > 0)
      .sort((a, b) => a.complexity - b.complexity)
      .map((d) => d.toString())
      .join('\n')
  }
}
