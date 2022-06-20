import 'reflect-metadata'

const RMset = Reflect.metadata

export function Name(name: string) {
  return RMset('name', name)
}

export function Pos(pos: number) {
  return RMset('pos', pos)
}

export function Format(format: (v?: any) => any) {
  return RMset('format', format)
}

export function getCSVFields(target: any) {
  const sortBy = (k: string) =>
    (Reflect.getMetadata('pos', target, k) as number) ?? 0

  return getPossibleKeys(target)
    .filter((k) => {
      const keys = Reflect.getMetadataKeys(target, k)
      return ['name', 'pos', 'format'].some((f) => keys.includes(f))
    })
    .sort((a, b) => sortBy(a) - sortBy(b))
}

export function getCSVHeaders(target: any): string {
  return getCSVFields(target)
    .map((k) => Reflect.getMetadata('name', target, k) ?? k)
    .join(',')
}

export function getCSVLine(target: any): string {
  return getCSVFields(target)
    .map((k) => {
      const fn = Reflect.getMetadata('format', target, k)
      return fn ? fn(target[k]) : target[k]
    })
    .join(',')
}

function getAllProperties(obj: Object): any {
  if (!obj) return Object.create(null)

  return {
    ...getAllProperties(Object.getPrototypeOf(obj)),
    ...Object.getOwnPropertyDescriptors(obj),
  }
}

function getPossibleKeys(obj: Object) {
  const arr = Reflect.ownKeys(obj).concat(
    Object.keys(getAllProperties(obj))
  ) as string[]
  return [...new Set(arr)]
}

// class B {
//   @Pos(0)
//   get c(): string {
//     return 1 + 'ccc'
//   }

//   @Pos(3)
//   d = 9
// }

// class A extends B {
//   @Pos(2)
//   a = 3

//   @Pos(1)
//   b?: string
// }

// console.log('Object.keys(target) :>> ', getPossibleKeys(A))
// console.log('Object.keys(target) :>> ', getPossibleKeys(new A()))

// console.log('TEST :>> ', getCSVHeaders(new A()))
