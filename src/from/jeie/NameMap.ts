import { IType, iTypePrefix } from './IType'

export type NameMap = { info: { total: number } } & Visible
export type NameMapJson = Record<IType, Visible>
export type Visible = Record<string, NameData>
export interface NameData {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}

export default function getNameMap(nameMapJsonTxt: string): NameMap {
  const nameMapJson: NameMapJson = JSON.parse(nameMapJsonTxt)

  const nameMap: NameMap = {
    info: {
      total: Object.values(nameMapJson).reduce(
        (a, b) => a + Object.keys(b).length,
        0
      ),
    } as any,
  }

  Object.entries(nameMapJson).forEach(([itype, vis]) => {
    let prefix: string = iTypePrefix[itype as IType]
    if (prefix === undefined)
      throw new Error('Could not find iType in name map: ' + itype)
    prefix = prefix ? prefix + ':' : ''

    Object.entries(vis).forEach(([id, data]) => {
      nameMap[prefix + id] = data
    })
  })

  return nameMap
}
