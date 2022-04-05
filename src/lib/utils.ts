export function cleanupNbt(o?: any): object | undefined {
  if (!o) return

  for (const k in o) {
    if (!o[k] || typeof o[k] !== 'object') {
      continue // If null or not an object, skip to the next iteration
    }

    // The property is an object
    cleanupNbt(o[k]) // <-- Make a recursive call on the nested object
    if (Object.keys(o[k]).length === 0) {
      delete o[k] // The object had no properties, so delete that property
    }
  }

  if (!Object.keys(o).length) return undefined // Return undefined if object is empty
  return o
}

export function objToString(obj: any, ndeep = 1): string {
  const t: string = typeof obj
  if (t === 'string') return '"' + obj + '"'
  if (t === 'function') return obj.name || obj.toString()
  if (t === 'object') {
    const indent = Array(ndeep).join('\t')
    const isArray = Array.isArray(obj)
    return (
      '{['[Number(isArray)] +
      Object.keys(obj)
        .map((key) => {
          const quoted = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(key)
            ? key
            : `"${key}"`
          return (
            '\n\t' +
            indent +
            (isArray ? '' : quoted + ': ') +
            objToString(obj[key], ndeep + 1)
          )
        })
        .join(',') +
      '\n' +
      indent +
      '}]'[Number(isArray)]
    ).replace(/[\s\t\n]+(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/g, '')
  }

  return obj?.toString() ?? ''
}
