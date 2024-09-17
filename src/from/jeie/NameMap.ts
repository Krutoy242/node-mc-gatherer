import type { IType } from './IType'
import { iTypePrefix } from './IType'

type NameMapJson = Record<IType, RawVisible>
type RawVisible = Record<string, RawNameData>
interface RawNameData {
  en_us: string
  en_us_tooltip?: string
  tag?: string
}

export type NameMap = { info: { total: number } } & Visible
type Visible = Record<string, NameData>
interface NameData {
  name: string
  tooltips?: string[]
  tag?: string
}

export default function getNameMap(nameMapJsonTxt: string): NameMap {
  const nameMapJson: NameMapJson = JSON.parse(nameMapJsonTxt)

  const nameMap: NameMap = {
    info: {
      total: Object.values(nameMapJson).reduce(
        (a, b) => a + Object.keys(b).length,
        0,
      ),
    } as any,
  }

  Object.entries(nameMapJson).forEach(([itype, vis]) => {
    let prefix: string = iTypePrefix[itype as IType]
    if (prefix === undefined)
      throw new Error(`Could not find iType in name map: ${itype}`)
    prefix = prefix ? `${prefix}:` : ''

    Object.entries(vis).forEach(([id, o]) => {
      let tag = o.tag

      // Strip display tags
      const displayTagIndex = tag?.indexOf('display:\{')
      if (tag && displayTagIndex && displayTagIndex !== -1) {
        tag = pruneSNbt(tag, displayTagIndex)
      }
      const isTagFutile = (tag === '' || tag === '{}') && id.split(':').length === 4
      const fullId = prefix + id
      const prunedId = isTagFutile
        ? fullId.replace(/:\w+$/, '')
        : fullId

      const tooltips = parseTooltips(id, o.en_us_tooltip)

      if (!isTagFutile || !nameMap[prunedId]) {
        nameMap[prunedId] = { name: o.en_us, tooltips, tag }
      }
    })
  })

  return nameMap
}

export function pruneSNbt(sNbt: string, displayTagIndex?: number) {
  displayTagIndex ??= sNbt.indexOf('display:\{')
  const newTag = sNbt.substring(0, displayTagIndex) + sNbt
    .substring(displayTagIndex)
    .replace(/\bLore:\["(?:[^"\\]|\\.)*"(?:,"(?:[^"\\]|\\.)*")*\],?/i, '')
    .replace(/\bLocName:"(?:[^"\\]|\\.)*",?/i, '')
    .replace(/\bName:"(?:[^"\\]|\\.)*",?/i, '')

  return newTag.replace(/,display:\{\}|display:\{\},?/i, '')
}

function parseTooltips(id: string, rawTooltip?: string): string[] | undefined {
  if (!rawTooltip)
    return

  const lines = rawTooltip.split(/\\n|\n/g).filter((line) => {
    if (!line)
      return false
    const l = line.trim()
    if (!l)
      return false

    if (
      id.startsWith(l) // item ID
      || l.startsWith('§9§o') // Mod name
      || l.startsWith('Durability:')
      || l.startsWith('§6Bauble ')
      || l.startsWith('§bRad Resistance: ')
      || l.startsWith('Nutrients: ')
      || l.startsWith('§o Burn time ')
      || l.startsWith('Fuel Details')
      || l === 'Mining control is §r§cDisabled§r'
    ) {
      return false
    }

    const noColors = l.replace(/§./g, '')

    if (
      /(?:Hold|Press) .?(?:Shift|CTRL|Control)/i.test(noColors)
      || /Empty.?/i.test(noColors)
      || /~.+ mB UU/i.test(noColors)
    ) {
      return false
    }

    return true
  })

  return lines.length ? lines : undefined
}
