import { parse as csvParseSync } from 'csv-parse/sync'

import { naturalSort } from '../lib/utils'
import { createFileLogger } from '../log/logger'

import { prefferedModSort } from './mod_sort'

export interface OredictMap {
  [oreName: string]: string[]
}
const log = createFileLogger('oreDict.log')

export default function genOreDictionary(csvText: string) {
  const dict: OredictMap = {}

  const fluids: {
    'OreDict Key': string
    'Registry name': string
    'Meta/dmg': string
    'Display name': string
    NBT: string
  }[] = csvParseSync(csvText, {
    columns: true,
  })

  for (const line of fluids) {
    const id =
      `${line['Registry name']}:${line['Meta/dmg']}` +
      (line.NBT ? ':' + line.NBT : '')

    ;(dict[line['OreDict Key']] ??= []).push(id)
  }

  Object.values(dict).forEach((arr) =>
    arr.sort(
      (a, b) =>
        prefferedModSort(getItemSource(a), getItemSource(b)) ||
        naturalSort(a, b)
    )
  )

  log(
    Object.entries(dict)
      .sort(([a], [b]) => naturalSort(a, b))
      .map(([oreName, item]) => `${oreName} = ${item.join(' ')}`)
      .join('\n')
  )

  return dict
}

function getItemSource(id: string): string {
  return id.split(':')[0]
}
