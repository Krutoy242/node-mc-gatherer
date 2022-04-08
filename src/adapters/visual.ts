import { DefinitionStoreMap } from '../lib/items/DefinitionStore'

export default function customRender(
  store: DefinitionStoreMap,
  source: string,
  entry: string,
  meta: string,
  tag: string
): [viewBox?: string, display?: string] {
  const map = {
    aspect: {
      __: () => [
        store[
          `thaumcraft:crystal_essence:0:{Aspects:[{amount:1,key:"${entry.toLowerCase()}"}]}`
        ].viewBox,
        'Aspect: ' + entry,
      ],
    },

    placeholder: {
      RF: {
        __: () => [
          store['thermalfoundation:meter:0'].viewBox,
          '{' + entry + '}',
        ],
      },
      Exploration: {
        __: () => [store['botania:tinyplanet:0'].viewBox, '{' + entry + '}'],
      },
      __: () => [
        store[
          'openblocks:tank:0:{tank:{FluidName:"betterquesting.placeholder",Amount:16000}}'
        ].viewBox,
        '{' + entry + '}',
      ],
    },

    thaumcraft: {
      infernal_furnace: {
        __: () => [store['minecraft:nether_brick:0'].viewBox],
      },
    },
  }

  const stairs = [source, entry, meta, tag]
  let k = 0
  let pointer: any = map
  while (typeof pointer !== 'function') {
    pointer = pointer[stairs[k]] ?? pointer.__ ?? (() => [])
    k++
  }
  return pointer()
}
