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

  minecraft_crafting: (cat) => ({
    ...cat,
    catalysts: ['minecraft:crafting_table:0'],
  }),
}

export default adapters
