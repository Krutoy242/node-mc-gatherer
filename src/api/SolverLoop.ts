export function solverLoop<T, U extends any[]>(
  action: (def: T, ...args: U) => ((readonly[T, ...U])[] | undefined)
) {
  function safeLoop(
    visited: Set<T>,
    currentDef: T,
    ...currentArgs: U
  ) {
    if (visited.has(currentDef)) return
    visited.add(currentDef)

    const nextSteps = action(currentDef, ...currentArgs)
    if (!nextSteps) return

    // --------------------
    // Holded items - items that would be looped later
    const onHold = new Set<T>()
    nextSteps.forEach(([def]) => {
      if (visited.has(def)) return
      onHold.add(def)
      visited.add(def)
    })
    // --------------------

    for (const [def, ...newArgs] of nextSteps) {
      if (onHold.has(def)) {
        onHold.delete(def)
        visited.delete(def)
      }
      safeLoop(visited, def, ...newArgs)
    }
  }

  return (initialDef: T, ...args: U) => safeLoop(new Set<T>(), initialDef, ...args)
}
