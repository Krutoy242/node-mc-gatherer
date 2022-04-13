import Definition from '../lib/items/Definition'

type VisFunc = () => {
  viewBox?: string
  display?: string
}
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
): {
  viewBox?: string
  display?: string
} {
  const root: Pointer = {
    placeholder: {
      rf: {
        __: () => ({
          viewBox: get('thermalfoundation:meter:0').viewBox,
          display: `{${entry}}`,
        }),
      },
      exploration: {
        __: () => ({
          viewBox: get('botania:tinyplanet:0').viewBox,
          display: `{${entry}}`,
        }),
      },
    },

    thaumcraft: {
      infernal_furnace: {
        __: () => ({ viewBox: get('minecraft:nether_brick:0').viewBox }),
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
