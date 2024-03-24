import volumes from './volumes.json'

import type { Based } from '.'

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
  const vols = volumes as unknown as VolumesJson

  function get(obj: undefined | VolumeData | number): [number, string?] {
    if (obj === undefined)
      return [1]
    if (typeof obj === 'number')
      return [obj]
    if (obj._vol !== undefined)
      return [obj._vol, obj._unit]
    return [1]
  }

  return get(
    (vols as any)[source]?.[entry]?.[meta ?? ''] ?? (vols as any)[source]?.[entry] ?? vols[source],
  )
}

export function getVolumed(based: Based, amount: number): string {
  const [vol, unit] = getVolume(based)
  return `${amount / vol}${unit ?? ''}`
}
