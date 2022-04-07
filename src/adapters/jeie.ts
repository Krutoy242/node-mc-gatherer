import {
  Ingredient,
  Item,
  JEIECustomRecipe,
  JEIERecipe,
  JEIExporterCategory,
  Slot,
} from '../from/JEIExporterTypes'
const { max, min } = Math

const adapters: Map<
  RegExp,
  (
    cat: JEIExporterCategory,
    getFullStack: (ingr: Item) => string
  ) => JEIECustomRecipe[]
> = new Map()

function getItem(id: string, amount = 1): Ingredient {
  return { amount, stacks: [{ type: 'item', name: id }] }
}

// Clear recipes for this entries
adapters.set(
  new RegExp(
    'EIOTank' +
      '|minecraft__anvil' +
      '|thermalexpansion__transposer__fill' +
      '|thermalexpansion__transposer__extract' +
      '|GENDUSTRY__SAMPLER' +
      '|minecraft__brewing' +
      '|chisel__chiseling' +
      '|jei__information' +
      '|THAUMCRAFT_ASPECT_FROM_ITEMSTACK' +
      '|jeresources__worldgen' +
      '|petrified__burn__time' +
      '|xu2__machine__extrautils2__generator__culinary' +
      '|jeresources__mob' +
      '|jeresources__villager'
  ),
  () => []
)

// Take only first item as catalyst blacklist
adapters.set(/^(?!.*(extendedcrafting__ender_crafting))/, (cat) => {
  const catalyst: Ingredient[] = cat.catalysts
    .slice(0, 1)
    .map((item) => ({ stacks: [item], amount: 1 }))
  return cat.recipes.map((rec) => Object.assign(rec, { catalyst }))
})

adapters.set(/minecraft__crafting/, (cat) => {
  let newRecs: JEIECustomRecipe[] = cat.recipes.filter(
    (rec) =>
      !rec.input.items.some((item) =>
        item.stacks.some((stack) => stack.name === 'ic2:jetpack_electric:0')
      )
  )

  const crTable = getItem('minecraft:crafting_table:0')
  newRecs = newRecs.map((rec) => {
    const x = rec.input.items.map((slot) => slot.x)
    const y = rec.input.items.map((slot) => slot.y)
    const isSimple = max(...x) - min(...x) <= 18 && max(...y) - min(...y) <= 18
    return Object.assign(rec, { catalyst: isSimple ? [] : [crTable] })
  })

  // Items that give back
  newRecs.forEach((rec) => {
    rec.input.items.forEach((inp) => {
      if (inp.stacks[0]?.name === 'minecraft:milk_bucket:0') {
        rec.output.items.push({
          x: 0,
          y: 0,
          ...getItem('minecraft:bucket:0'),
        })
      }
    })
  })

  return newRecs
})

adapters.set(/tconstruct__casting_table/, (cat) => {
  const catalyst = [
    getItem('tconstruct:casting:0'),
    getItem('tconstruct:casting:1'),
  ]

  const newRecipes: JEIECustomRecipe[] = []
  cat.recipes.forEach((rec) => {
    rec.input.items.splice(1, 1) // Remove Duplicate of input liquid

    // Table with 0 or 1 cast on table
    const slot = rec.input.items[1]
    if (slot.stacks.length <= 1) {
      const castOnTable = slot.stacks[0]
      if (
        castOnTable &&
        (castOnTable.name.startsWith('tcomplement:cast:') ||
          castOnTable.name.startsWith('tconstruct:cast:') ||
          castOnTable.name.startsWith('tconstruct:cast_custom:'))
      ) {
        // Cast is reusable, move it to catalysts
        rec.input.items.splice(1, 1)
        newRecipes.push({
          ...rec,
          catalyst: [...catalyst, getItem(castOnTable.name)],
        })
      } else {
        newRecipes.push({ ...rec, catalyst })
      }
      return
    }

    // Table with many casts on table
    slot.stacks.forEach((stack) => {
      newRecipes.push({
        input: { items: [rec.input.items[0], { ...slot, stacks: [stack] }] },
        output: rec.output,
        catalyst,
      })
    })
  })

  return newRecipes
})

adapters.set(/tconstruct__smeltery/, (cat) => {
  const catalyst = [getItem('tconstruct:smeltery_controller:0')]

  return cat.recipes.map((rec) => {
    rec.output.items = [rec.output.items[0]]
    return Object.assign(rec, { catalyst })
  })
})

adapters.set(/tinkersjei__tool_stats/, (cat) => {
  const catalyst = [getItem('tconstruct:tooltables:3')]

  const newRecipes: JEIECustomRecipe[] = []
  cat.recipes
    .filter(
      (rec) =>
        !rec.input.items.some((slot) =>
          slot.stacks.some((ingr) => ingr.type === 'fluid')
        )
    )
    .forEach((rec) => {
      let input = rec.input.items.find((slot) => slot.x <= 64)
      if (!input) throw new Error("Cannot find input for Tinker's Tool")

      rec.input.items.forEach((slot) => {
        if (slot.x > 64)
          slot.stacks.forEach((ingr) =>
            newRecipes.push({
              input: { items: [input as Slot] },
              output: { items: [{ ...slot, stacks: [ingr] }] },
              catalyst,
            })
          )
      })
    })
  return newRecipes
})

// Everything
adapters.set(/.*/, (cat, getFullID) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach((slot) => {
      slot.stacks.forEach((stack) => {
        if (!stack.name.startsWith('forge:bucketfilled:0:')) return
        const m = getFullID(stack).match(
          /^forge:bucketfilled:0:\{FluidName:"([^"]+)",Amount:1000\}$/
        )
        if (!m) return
        stack.type = 'fluid'
        stack.name = m[1]
      })
    })
  })
  return cat.recipes
})

export default adapters
