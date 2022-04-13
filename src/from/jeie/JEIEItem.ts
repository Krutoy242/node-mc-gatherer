import { OredictMap } from '../oredict'

import { iTypePrefix } from './IType'
import { JEIEItem } from './JEIECategory'
import { NameMap } from './NameMap'

export default function getFullId(
  ingr: JEIEItem,
  tooltipMap: NameMap,
  oreDict: OredictMap
): string {
  if (ingr.type === 'oredict') {
    const oreItem = oreDict[ingr.name]
    if (!oreItem) throw new Error('No item found for ore: ' + ingr.name)
    return oreItem
  }

  const splitted = ingr.name.split(':')
  let sNbt = ''
  let base: string
  if (splitted.length > 3 && splitted[3][0] !== '{') {
    base = splitted.slice(0, 3).join(':')
    // f62 is hash of "{}" - empty nbt. Just ignore it
    if (splitted[3] !== 'f62') {
      sNbt = tooltipMap[ingr.name]?.tag ?? ''
    }
  } else base = ingr.name

  let prefix: string = iTypePrefix[ingr.type]
  if (prefix === undefined) {
    console.log('⚠️  Unregistered JEIExporter type:', ingr.type)
    prefix = 'unknown'
  }

  return (prefix ? prefix + ':' : '') + base + (sNbt ? ':' + sNbt : '')
}
