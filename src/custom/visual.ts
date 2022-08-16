import { capitalize } from 'lodash'
import type { BaseVisible } from '../api'
import type Definition from '../lib/items/Definition'

type VisFunc = () => Partial<BaseVisible>
type Pointer =
  | VisFunc
  | {
    [key: string]: VisFunc | Pointer
  }

export default function customRender(
  source: string,
  entry: string,
  meta: string | undefined,
  sNbt: string | undefined,
  get: (id: string) => Definition
): Partial<BaseVisible> {
  const alias = (id: string) => ({
    imgsrc : get(id)?.imgsrc,
    display: `{${capitalize(entry)}}`,
  })

  const root: Pointer = {
    placeholder: {
      ticks      : { __: () => alias('botania:cosmetic:17') },
      rf         : { __: () => alias('thermalfoundation:meter:0') },
      exploration: { __: () => alias('botania:tinyplanet:0') },
      xp         : { __: () => alias('mysticalagriculture:experience_essence:0') },
      fight      : { __: () => alias('endreborn:tool_sword_wolframium:0') },
      trade      : { __: () => alias('openblocks:trophy:9:{entity_id:"minecraft:villager"}') },
    },

    thaumcraft: {
      infernal_furnace: {
        __: () => ({ imgsrc: get('minecraft:nether_brick:0').imgsrc }),
      },
    },

    dimension: {
      __: () => ({
        imgsrc : get('botania:tinyplanet:0').imgsrc,
        display: `{Dimension ${entry}}`,
      }),
    },
  }

  const stairs = [source, entry, meta, sNbt]
  let k = 0
  let pointer: Pointer = root
  while (typeof pointer !== 'function') {
    pointer = pointer[stairs[k] ?? ''] ?? pointer.__ ?? (() => [])
    k++
  }
  return pointer()
}
