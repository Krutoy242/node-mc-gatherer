import volumes from './volumes.json'

import { Based } from '.'

type VolumeData =
  | number
  | {
      _vol: number
      _unit: string
    }

interface VolumesJson {
  [source: string]:
    | VolumeData
    | {
        [entry: string]:
          | VolumeData
          | {
              [meta: string]: VolumeData
            }
      }
}

export function getVolume(based: Based): [volume: number, units?: string] {
  const { source, entry, meta } = based
  // const vols = volumes as unknown as VolumesJson
  const vols = volumes as any

  function get(obj: any): [number, string?] {
    if (obj === undefined) return [1]
    if (typeof obj === 'number') return [obj]
    if (obj._vol !== undefined) return [obj._vol, obj._unit]
    return [1]
  }

  return get(
    vols[source]?.[entry]?.[meta ?? ''] ?? vols[source]?.[entry] ?? vols[source]
  )
}

export function getVolumed(based: Based, amount: number): string {
  const [vol, unit] = getVolume(based)
  return `${amount / vol}${unit ?? ''}`
}
