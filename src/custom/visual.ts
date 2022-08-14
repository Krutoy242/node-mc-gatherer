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
  const root: Pointer = {
    placeholder: {
      rf: {
        __: () => ({
          imgsrc : get('thermalfoundation:meter:0').imgsrc,
          display: `{${entry}}`,
        }),
      },
      exploration: {
        __: () => ({
          imgsrc : get('botania:tinyplanet:0').imgsrc,
          display: `{${entry}}`,
        }),
      },
    },

    thaumcraft: {
      infernal_furnace: {
        __: () => ({ imgsrc: get('minecraft:nether_brick:0').imgsrc }),
      },
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
