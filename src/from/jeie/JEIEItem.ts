import { iTypePrefix } from './IType'
import type { JEIEItem } from './JEIECategory'
import type { NameMap } from './NameMap'

export default function getFullId(ingr: JEIEItem, tooltipMap: NameMap): string {
  const splitted = ingr.name.split(':')
  let sNbt = ''
  let base: string
  if (splitted.length > 3 && splitted[3][0] !== '{') {
    base = splitted.slice(0, 3).join(':')
    // f62 is hash of "{}" - empty nbt. Just ignore it
    if (splitted[3] !== 'f62')
      sNbt = filterTag(tooltipMap[ingr.name]?.tag)
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

const displayRgx = /display:\{(,?(Name:"[^"]*"|Lore:\["[^"]*"(,"[^"]*")*\])){0,2}\}/

function filterTag(tag?: string): string {
  if (tag === undefined)
    return ''

  const noDisplay = tag.replace(
    new RegExp(`${displayRgx.source},?|,${displayRgx.source}`),
    '',
  )

  return noDisplay === '{}' ? '' : noDisplay
}

// console.log(
//   [
//     '{display:{Name:"White§r Conveyor Belt"}}',
//     '{FluidName:"low_pressure_steam",Amount:1000,display:{Name:"Any container with Low Pressure Steam * 1000 mB"}}',
//     '{mana:17500,display:{Name:"§b17500 Mana"}}',
//     '{owner:"ic2",scan:1b,growth:1b,id:"wheat",resistance:1b,gain:1b,display:{Lore:["§6§lRequirments: ","§6Light level of at least 9"]}}',
//     '{Potion:"potioncore:long_purity",display:{Name:"Splash Potion of Wither Purity",Lore:["Bla"]}}',
//   ].map(filterTag)
// )
