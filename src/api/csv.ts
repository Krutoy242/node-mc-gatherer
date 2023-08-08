import type { BaseItem, BaseItemMap } from '.'
import { Tree, baseItemSetup } from '.'

type CSVBaseItem = {
  [key in keyof typeof baseItemSetup]-?: string
}

export function loadDataCSVEx(csvText: string, parserer: any) {
  return new Promise<BaseItem[]>((resolve, reject) => {
    const table: CSVBaseItem[] = []
    const parser = parserer(csvText, { columns: true })

    parser.on('readable', () => {
      let record
      while ((record = parser.read()) !== null) table.push(record as CSVBaseItem)
    })

    parser.on('end', () => {
      resolve(parseOutput(table))
    })
    parser.on('error', reject)
  })
  // })
}

function parseOutput(table: CSVBaseItem[]): BaseItem[] {
  const result: BaseItem[] = []

  table.forEach((o) => {
    const r: any = {}
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
