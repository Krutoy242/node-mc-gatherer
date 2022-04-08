import { IType } from './IType'

export type NameMap = Record<IType, Visible>
export type Visible = Record<string, NameData>
export interface NameData {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}
