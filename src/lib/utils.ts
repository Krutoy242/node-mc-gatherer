export const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

function getTextFromTo(text: string, from: string, to: string): string {
  const startIndex = text.lastIndexOf(from)
  if (startIndex === -1) return ''

  const sub = text.substring(startIndex + from.length)
  const endIndex = sub.indexOf(to)

  return endIndex === -1 ? sub : sub.substring(0, endIndex)
}

export function getCTBlock(
  crafttweakerLogTxt: string,
  from: string,
  to: string
): string[] | undefined {
  const txtBlock = getTextFromTo(crafttweakerLogTxt, from, to)
  // if (!txtBlock) throw new Error('Cant read data from crafttweaker.log')
  if (!txtBlock) return

  return [...txtBlock.matchAll(/^\[\w+\]\[\w+\]\[INFO\] (.*)$/gm)]
    .map(m => m[1])
    .filter(s => s)
}

export function escapeCsv(s?: string): string {
  if (s?.includes('"') || s?.includes(',')) return `"${s.replace(/"/g, '""')}"`
  return s ?? ''
}

/**
 * Makes method always return `this`
 */
export function fluent(_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    originalMethod.apply(this, args)
    return this
  }

  return descriptor
}
