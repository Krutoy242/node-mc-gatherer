import type { JEIEItem } from './JEIECategory'
import type { NameMap } from './NameMap'
import { iTypePrefix } from './IType'

export default function getFullId(ingr: JEIEItem, tooltipMap: NameMap): string {
  const splitted = ingr.name.split(':')
  let sNbt = ''
  let base: string
  if (splitted.length > 3 && splitted[3][0] !== '{') {
    base = splitted.slice(0, 3).join(':')
    // f62 is hash of "{}" - empty nbt. Just ignore it
    if (splitted[3] !== 'f62') {
      sNbt = tooltipMap[ingr.name]?.tag ?? ''
      if (sNbt === '{}')
        sNbt = ''
    }
  }
  else { base = ingr.name }

  let prefix: string = iTypePrefix[ingr.type]
  if (prefix === undefined) {
    // eslint-disable-next-line no-console
    console.log('\n\n\n⚠️  Unregistered JEIExporter type:', ingr.type, '\n\n\n')
    prefix = 'unknown'
  }

  return (prefix ? `${prefix}:` : '') + base + (sNbt ? `:${sNbt}` : '')
}
