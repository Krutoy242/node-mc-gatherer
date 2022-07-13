import { BaseItem, BaseItemMap, baseItemSetup, Tree } from '.'

export interface CSVFile {
  csv: () => string
}

export interface CSVLine {
  csv: () => string
}

type CSVBaseItem = {
  [key in keyof typeof baseItemSetup]-?: string
}

export function loadDataCSV(csvText: string) {
  return new Promise<BaseItem[]>((resolve, reject) => {
    ;(typeof process === 'object'
      ? import('csv-parse')
      : import('csv-parse/browser/esm')
    ).then(({ default: { parse } }) => {
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
  const [source, entry, meta, sNbt] = Tree.baseFromId(r.id)
  return { ...r, source, entry, meta, sNbt }
}
// loadDataCSV(fs.readFileSync('data_items.csv', 'utf8')).then((data) =>
//   console.log(data)
// )
