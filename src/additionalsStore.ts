/*=============================================
=           Additionals Store
=============================================*/

import {
  IndexedRawAdditionals,
  IndexedRawAdditionalsStore,
  RawAdditionalsStore,
} from './types'

type AdditID = string | number
type ValueOf<T> = T[keyof T]

export default class PrimalStoreHelper {
  private store: IndexedRawAdditionalsStore = {}
  private additionalsLength = 0

  constructor(private tooltipMap: { [id: string]: string }) {}

  get(definition: string) {
    return this.store[definition]
  }

  setField(
    id: AdditID,
    field?: keyof IndexedRawAdditionals,
    value?: ValueOf<IndexedRawAdditionals>
  ): IndexedRawAdditionals {
    const found = isNaN(Number(id))
      ? this.store[id]
      : Object.values(this.store)[id as number]

    let picked = found
    if (!picked) {
      picked = {
        index: this.additionalsLength++,
      }
      this.store[id] = picked
    }

    if (field) (picked[field] as any) ||= value

    return picked
  }

  exportAdditionals(): RawAdditionalsStore {
    this.assignVisuals()

    for (const key in this.store) {
      delete (this.store[key] as any).index
    }
    return this.store
  }

  private assignVisuals() {
    for (const key in this.store) {
      const ad = this.store[key]
      const hasRecipe = !!ad.recipes
      if (ad.viewBox && ad.display) continue

      const { source, entry, meta, tag } =
        key.match(
          /^(?<source>[^:{]+)(?::(?<entry>[^:{]+))?(?::(?<meta>[^:{]+))?(?<tag>\{.*\})?$/
        )?.groups ?? {}

      if (!source) throw new Error('Error on parsing ID: ' + key)

      if (tag) {
        const { viewBox, display } =
          this.store[`${source}:${entry}:${meta}`] ?? {}
        ad.viewBox ??= viewBox
        ad.display ??= display
      }
      if (ad.viewBox && ad.display) continue

      if (meta) {
        const { viewBox, display } = this.store[`${source}:${entry}:0`] ?? {}
        ad.viewBox ??= viewBox
        ad.display ??= display
      }
      if (ad.viewBox && ad.display) continue

      if (meta) {
        const { viewBox, display } = this.store[`${source}:${entry}`] ?? {}
        ad.viewBox ??= viewBox
        ad.display ??= display
      }
      if (ad.viewBox && ad.display) continue

      ad.display ??=
        this.tooltipMap[key] ??
        this.tooltipMap[`${source}:${entry}:${meta}`] ??
        this.tooltipMap[`${source}:${entry}:0`]

      const [viewBox, display] = this.customRender(source, entry, meta, tag)
      ad.viewBox ??= viewBox
      ad.display ??= display
      if (ad.viewBox && ad.display) continue

      if (!ad.display) {
        ad.display ??= `[${key}]`
        if (hasRecipe)
          console.log(' cant find Display for', key.substring(0, 100))
      }

      if (!ad.viewBox) {
        ad.viewBox ??= this.store['openblocks:dev_null:0']?.viewBox
        if (hasRecipe)
          console.log(' cant find viewBox for', key.substring(0, 100))
      }
    }
  }

  private customRender(
    source: string,
    entry: string,
    _meta: string,
    _tag: string
  ) {
    if (source === 'aspect') {
      const a =
        this.store[
          `thaumcraft:crystal_essence:0{Aspects:[{amount:1,key:"${entry.toLowerCase()}"}]}`
        ]
      return [a.viewBox, 'Aspect: ' + entry]
    }

    if (source === 'placeholder') {
      if (entry === 'RF') {
        return [
          this.store['thermalfoundation:meter:0'].viewBox,
          '{' + entry + '}',
        ]
      }
      if (entry === 'Exploration') {
        return [this.store['botania:tinyplanet:0'].viewBox, '{' + entry + '}']
      }
      const a =
        this.store[
          'openblocks:tank:0{tank:{FluidName:"betterquesting.placeholder",Amount:16000}}'
        ]
      return [a.viewBox, '{' + entry + '}']
    }

    if (source === 'thaumcraft' && entry === 'infernal_furnace') {
      const a = this.store['minecraft:nether_brick:0']
      return [a.viewBox]
    }

    return []
  }
}
