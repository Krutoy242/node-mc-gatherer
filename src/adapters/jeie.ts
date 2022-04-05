import { JEIExporterCategory } from '../from/JEIExporterTypes'

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
      '|xu2__machine__extrautils2__generator__culinary'
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

export default adapters
