/* =============================================
=           Additionals Store
============================================= */

import { ITypes } from '../from/JEIExporterTypes'

export interface ExportDefinition {
  viewBox?: string
  display?: string
  recipes?: number[]
}

export interface Definition {
  /**
   * Full ID source:entry:meta(:{nbt})?
   */
  id: string
  iType: ITypes
  viewBox?: string
  display?: string
  recipes?: Set<number>
}

export interface DefinitionStoreMap {
  [id: string]: Definition
}

export default class DefinitionStore {
  store: DefinitionStoreMap = {}

  get(id: string, iType: ITypes = 'item') {
    return (this.store[id] ??= { id, iType })
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
}
