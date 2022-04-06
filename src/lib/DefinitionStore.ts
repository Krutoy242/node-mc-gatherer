/* =============================================
=           Additionals Store
============================================= */

import { ITypes } from '../from/JEIExporterTypes'

import Calculable from './Calculable'

export interface ExportDefinition {
  viewBox?: string
  display?: string
  recipes?: number[]
}

export interface Definition extends Calculable {
  /**
   * Full ID source:entry:meta(:{nbt})?
   */
  id: string
  iType: ITypes
  viewBox?: string
  display?: string
  recipes?: Set<number>

  /**
   * Recipes that depends on this item
   */
  dependencies?: Set<number>
}

export interface DefinitionStoreMap {
  [id: string]: Definition
}

export default class DefinitionStore {
  store: DefinitionStoreMap = {}

  get(id: string, iType: ITypes = 'item') {
    return (this.store[id] ??= {
      id,
      iType,
      complexity: 1000000.0,
      cost: 1000000.0,
      processing: 0.0,
      purity: 0.0,
    })
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
