import { IType } from './IType'

export type NameMap = NameMapJson & { info: { total: number } }
export type NameMapJson = Record<IType, Visible>
export type Visible = Record<string, NameData>
export interface NameData {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}

export default function getNameMap(nameMapJson: string): NameMap {
  const nameMap: NameMap = JSON.parse(nameMapJson)

  nameMap.info = {
    total: Object.values(nameMap).reduce(
      (a, b) => a + Object.keys(b).length,
      0
    ),
  }

  return nameMap
}
