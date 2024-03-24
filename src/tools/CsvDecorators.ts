import 'reflect-metadata'

type FormatFunction = (value: any) => string

type CsvOptions = Map<string, {
  position: number
  format?: FormatFunction
}>

const csvMetadataKey = Symbol('csv')

export function Csv(position: number, format?: FormatFunction) {
  return function (target: any, key: string) {
    const properties: CsvOptions | undefined = Reflect.getMetadata(csvMetadataKey, target)

    Reflect.defineMetadata(
      csvMetadataKey,
      new Map([...(properties as any ?? [])]).set(key, { position, format }),
      target,
    )
  }
}

function getSortedMetadata(obj: any) {
  const properties = [
    ...(Reflect.getMetadata(csvMetadataKey, obj.prototype) as CsvOptions ?? []),
  ]
  properties.sort(([,a], [,b]) => a.position - b.position)
  return properties
}

export function getHeaders<T>(clazz: new (...args: any) => T): string[] {
  return getSortedMetadata(clazz).map(([key]) => key)
}

export function getCsvLine<T extends object>(obj: T): string {
  return getSortedMetadata(obj.constructor)
    .map(([key, { format }]) => {
      const value = obj[key as keyof T]
      return format ? format(value) : value
    })
    .join(',')
}

/*
class Item {
  @Csv(2, v => v.toUpperCase())
  public name: string

  @Csv(1)
  public price: number

  constructor(name: string, price: number) {
    this.name = name
    this.price = price
  }
}

class PackedItem extends Item {
  @Csv(3)
  public pack: string

  constructor(name: string, price: number, pack: string) {
    super(name, price)
    this.pack = pack
  }
}

const item = new Item('Apple', 1.99)

console.log(getHeaders(Item)) // Output: price,name
console.log(getCsvLine(item)) // Output: 1.99,APPLE

const packedItem = new PackedItem('Orange', 2.05, 'cardbox')

console.log(getHeaders(Item)) // Output: price,name
console.log(getCsvLine(item)) // Output: 1.99,APPLE

console.log(getHeaders(PackedItem)) // Output: price,name,pack
console.log(getCsvLine(packedItem)) // Output: 2.05,ORANGE,cardbox
 */
