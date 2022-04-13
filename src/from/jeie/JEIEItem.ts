import { OredictMap } from '../oredict'

import { iTypePrefix } from './IType'
import { Item } from './JEIECategory'
import { NameMap } from './NameMap'

export default function getFullId(
  ingr: Item,
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
    if (splitted[3] !== 'f62') {
      // f62 is hash of "{}" - empty nbt. Just clean it
      sNbt = tooltipMap[ingr.name]?.tag ?? ''
      // if (!sNbt)
      //   throw new Error(
      //     `NBT hash provided but cant be found in tooltip map: ${ingr.type} ${ingr.name} `
      //   )
    }
  } else base = ingr.name

  let prefix: string = iTypePrefix[ingr.type]
  if (prefix === undefined) {
    console.log('⚠️  Unregistered JEIExporter type:', ingr.type)
    prefix = 'unknown'
  }

  return (prefix ? prefix + ':' : '') + base + (sNbt ? ':' + sNbt : '')
}
