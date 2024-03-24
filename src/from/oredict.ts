import { parse as csvParseSync } from 'csv-parse/sync'

import { naturalSort } from '../lib/utils'

import { prefferedModSort } from './mod_sort'

export interface OredictMap {
  [oreName: string]: string[]
}

export default function genOreDictionary(csvText?: string) {
  if (!csvText)
    return
  const dict: OredictMap = {}

  const entries: {
    'OreDict Key': string
    'Registry name': string
    'Meta/dmg': string
    'Display name': string
    'NBT': string
  }[] = csvParseSync(csvText, {
    columns: true,
  })

  for (const line of entries) {
    const id
      = `${line['Registry name']}:${line['Meta/dmg']}${
       line.NBT ? `:${line.NBT}` : ''}`

    ;(dict[line['OreDict Key']] ??= []).push(id)
  }

  Object.values(dict).forEach(arr =>
    arr.sort(
      (a, b) =>
        prefferedModSort(getItemSource(a), getItemSource(b))
        || naturalSort(a, b),
    ),
  )

  return dict
}

function getItemSource(id: string): string {
  return id.split(':')[0]
}
