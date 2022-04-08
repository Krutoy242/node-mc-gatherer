/* =============================================
=           Additionals Store
============================================= */

import { IType, iTypesMap } from '../../from/jeie/IType'

import Definition from './Definition'

export interface ExportDefinition {
  viewBox?: string
  display?: string
  recipes?: number[]
}

export interface DefinitionStoreMap {
  [id: string]: Definition
}

function sourceToType(source: string): IType {
  return (iTypesMap as any)[source] ?? 'item'
}

export default class DefinitionStore {
  store: DefinitionStoreMap = {}

  getUnsafe(id: string): Definition {
    const result = this.store[id]
    if (!result) throw new Error('Cannot get ' + id)
    return result
  }

  getById(id: string, iType: IType): Definition {
    return (this.store[id] ??= new Definition(id, iType))
  }

  getItem(id: string): Definition {
    return this.getById(id, 'item')
  }

  getAuto(id: string): Definition {
    const splitted: Parameters<this['getBased']> = id.split(':') as any
    if (splitted.length <= 1) throw new Error('Cannot autoget by id: ' + id)
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
    _meta?: number | string,
    sNbt?: string
  ): Definition {
    // eslint-disable-next-line eqeqeq
    const meta = _meta == 32767 || _meta == '*' ? 0 : _meta
    const id = `${source}:${entry}${meta !== undefined ? ':' + meta : ''}${
      sNbt ? ':' + sNbt : ''
    }`
    return this.getById(id, sourceToType(source))
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
