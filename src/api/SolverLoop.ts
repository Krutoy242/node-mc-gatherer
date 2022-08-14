export function solverLoop<T, U extends any[]>(
  action: (def: T, ...args: U) => ((readonly[T, ...U])[] | undefined)
) {
  function safeLoop(
    antiloop: Set<T>,
    def: T,
    ...args: U
  ) {
    if (antiloop.has(def)) return
    antiloop.add(def)

    const combined = action(def, ...args)
    if (!combined) return

    // --------------------
    // Holded items - items that would be looped later
    const onHold = new Set<T>()
    combined.forEach(([def]) => {
      if (antiloop.has(def)) return
      onHold?.add(def)
      antiloop.add(def)
    })
    // --------------------

    for (const [def, ...newArgs] of combined) {
      if (onHold.has(def)) {
        onHold.delete(def)
        antiloop.delete(def)
      }
      safeLoop(antiloop, def, ...newArgs)
    }
  }

  return (def: T, ...args: U) => safeLoop(new Set<T>(), def, ...args)
}
