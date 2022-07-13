export default class Store<T, U = string> {
  get: (id: U, skipCache?: boolean) => T

  private readonly store = new Map<U, T>()

  constructor(private unserialize: (id: U) => T) {
    this.get = (id, skipCache = false) => {
      if ((id as unknown) === '') throw new Error('ID cannot be empty')
      return (!skipCache && this.store.get(id)) || this.getNew(id)
    }
  }

  getUnsafe(id: U): T | undefined {
    return this.store.get(id)
  }

  [Symbol.iterator]() {
    return this.store.values()
  }

  protected set(id: U, value: T): T {
    this.store.set(id, value)
    return value
  }

  private getNew(id: U): T {
    return this.unserialize(id)
  }
}
