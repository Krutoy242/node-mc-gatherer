import { JEIExporterCategory } from './jeiexporter'

const adapters: {
  [key: string]: (cat: JEIExporterCategory) => JEIExporterCategory
} = {
  // 'botania_orechid(_ignem)?': (cat) => ({
  //   ...cat,
  //   recipes: cat.recipes.map((rec) => ({
  //     input: { items: rec.input.items.slice(0, 1) },
  //     output: { items: rec.input.items.slice(2) },
  //   })),
  // }),

  // deepmoblearningbm_digital_agonizer: (cat) => {
  //   cat.recipes.forEach((rec) =>
  //     cat.catalysts.push(rec.input.items.slice(0, 1)[0].stacks[0].name)
  //   )
  //   cat.catalysts = [...new Set(cat.catalysts)]
  //   return {
  //     ...cat,
  //     recipes: cat.recipes.map((rec) => ({
  //       input: { items: [] },
  //       output: { items: rec.input.items.slice(1) },
  //     })),
  //   }
  // },

  // Clear recipes for this entries
  ['EIOTank' +
  '|minecraft_anvil' +
  '|thermalexpansion_transposer_fill' +
  '|thermalexpansion_transposer_extract' +
  '|GENDUSTRY_SAMPLER' +
  '|minecraft_brewing' +
  '|chisel_chiseling' +
  '|jei_information' +
  '|THAUMCRAFT_ASPECT_FROM_ITEMSTACK' +
  '|jeresources_worldgen' +
  '|petrified_burn_time' +
  '|xu2_machine_extrautils2_generator_culinary' +
  '']: (cat) => ((cat.recipes = []), cat),

  // Take only first item as catalyst blacklist
  '((?!(extendedcrafting_ender_crafting)).)*': (cat) => (
    cat.catalysts.slice(0, 1), cat
  ),

  minecraft_crafting: (cat) => ({
    ...cat,
    catalysts: ['minecraft:crafting_table:0'],
    recipes: cat.recipes.filter(
      (rec) =>
        !rec.input.items.some((item) =>
          item.stacks.some((stack) => stack.name == 'ic2:jetpack_electric:0')
        )
    ),
  }),

  // '.*': (cat) => cat,
}

export default adapters
