import { parse } from 'csv-parse/browser/esm'

import { BaseItem, BaseItemMap, baseItemSetup } from './BaseItem'

export interface CSVFile {
  csv: () => string
}

export interface CSVLine {
  csv: () => string
}

export type BaseItemSerializable = {
  [key in keyof typeof baseItemSetup]?: any
}

type CSVBaseItem = {
  [key in keyof typeof baseItemSetup]-?: string
}

export function loadDataCSV(csvText: string) {
  return new Promise<BaseItem[]>((resolve, reject) => {
    const table: CSVBaseItem[] = []
    const parser = parse(csvText, { columns: true })

    parser.on('readable', () => {
      let record
      while ((record = parser.read()) !== null)
        table.push(record as CSVBaseItem)
    })

    parser.on('end', () => {
      resolve(parseOutput(table))
    })
    parser.on('error', reject)
  })
}

function parseOutput(table: CSVBaseItem[]): BaseItem[] {
  const result: BaseItem[] = []

  table.forEach((o) => {
    let r: any = {}
    ;(Object.keys(o) as unknown as (keyof CSVBaseItem)[]).forEach((k) => {
      const parse = baseItemSetup[k]
      r[k] = parse ? parse(o[k]) : o[k]
    })
    result.push(addAdditionalFields(r))
  })

  return result
}

function addAdditionalFields(r: BaseItemMap): BaseItem {
  const [source, entry, meta, ...sNbtArr] = r.id.split(':')
  const sNbt = sNbtArr.join(':')

  return {
    ...r,
    source,
    entry,
    meta: Number(meta),
    sNbt,
  }
}
// loadDataCSV(fs.readFileSync('data_items.csv', 'utf8')).then((data) =>
//   console.log(data)
// )
