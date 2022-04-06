import { runInContext } from 'lodash'

import { JEIExporterCategory, Recipe, Slot } from '../from/JEIExporterTypes'

const adapters: Map<RegExp, (cat: JEIExporterCategory) => JEIExporterCategory> =
  new Map()

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
  (cat) => ((cat.recipes = []), cat)
)

// Take only first item as catalyst blacklist
adapters.set(
  /^(?!.*(extendedcrafting__ender_crafting))/,
  (cat) => ((cat.catalysts = cat.catalysts.slice(0, 1)), cat)
)

adapters.set(/minecraft__crafting/, (cat) => {
  cat.recipes = cat.recipes.filter(
    (rec) =>
      !rec.input.items.some((item) =>
        item.stacks.some((stack) => stack.name === 'ic2:jetpack_electric:0')
      )
  )
  return cat
})

adapters.set(/tconstruct__casting_table/, (cat) => {
  cat.catalysts = [
    { type: 'item', name: 'tconstruct:casting:0' },
    { type: 'item', name: 'tconstruct:casting:1' },
  ]

  const newRecipes: Recipe[] = []
  cat.recipes.forEach((rec) => {
    rec.input.items.splice(1, 1)

    const slot = rec.input.items[1]
    if (slot.stacks.length <= 1) {
      newRecipes.push(rec)
      return
    }
    slot.stacks.forEach((stack) => {
      newRecipes.push({
        input: { items: [rec.input.items[0], { ...slot, stacks: [stack] }] },
        output: rec.output,
      })
    })
  })
  cat.recipes = newRecipes

  return cat
})

adapters.set(/tconstruct__smeltery/, (cat) => {
  cat.catalysts = [{ type: 'item', name: 'tconstruct:smeltery_controller:0' }]

  cat.recipes.forEach((rec) => {
    rec.output.items = [rec.output.items[0]]
  })

  return cat
})

adapters.set(/tinkersjei__tool_stats/, (cat) => {
  cat.catalysts = [{ type: 'item', name: 'tconstruct:tooltables:3' }]

  cat.recipes = cat.recipes.filter(
    (rec) =>
      !rec.input.items.some((slot) =>
        slot.stacks.some((ingr) => ingr.type === 'fluid')
      )
  )

  const newRecipes: Recipe[] = []
  cat.recipes.forEach((rec) => {
    let input = rec.input.items.find((slot) => slot.x <= 64)
    if (!input) throw new Error("Cannot find input for Tinker's Tool")

    rec.input.items.forEach((slot) => {
      if (slot.x > 64)
        slot.stacks.forEach((ingr) =>
          newRecipes.push({
            input: { items: [input as Slot] },
            output: { items: [{ ...slot, stacks: [ingr] }] },
          })
        )
    })
  })
  cat.recipes = newRecipes

  return cat
})

export default adapters
