import _ from 'lodash'

import {
  JEIECategory,
  JEIECustomRecipe,
  JEIEIngredient,
  JEIEItem,
  JEIESlot,
} from '../from/jeie/JEIECategory'
const { max, min } = Math

export interface Tools {
  getFullID: (ingr: JEIEItem) => string
  toolDurability: { [id: string]: number }
  getTool: (blockId: string) => string | undefined
}

const adapters: Map<RegExp, (cat: JEIECategory, tools: Tools) => void> =
  new Map()

function getIngr(id: string, amount = 1): JEIEIngredient {
  return { amount, stacks: [{ type: 'item', name: id }] }
}

function getSlot(id: string, amount = 1): JEIESlot {
  return { ...getIngr(id, amount), x: 0, y: 0 }
}

function getBucketFluid(
  stack: JEIEItem,
  getFullID: (ingr: JEIEItem) => string
): string | undefined {
  if (stack.name.startsWith('minecraft:')) {
    if (stack.name.startsWith('minecraft:water_bucket:0')) return 'water'
    if (stack.name.startsWith('minecraft:lava_bucket:0')) return 'lava'
    if (stack.name.startsWith('minecraft:milk:0')) return 'milk'
  }

  if (!stack.name.startsWith('forge:bucketfilled:0:')) return
  return getFullID(stack).match(
    /^forge:bucketfilled:0:\{FluidName:"([^"]+)",Amount:1000.*\}$/
  )?.[1]
}

function bucketToFluid(
  ingr: JEIEIngredient,
  getFullID: (ingr: JEIEItem) => string
): void {
  ingr.stacks.forEach((stack) => {
    if (!stack.name.startsWith('forge:bucketfilled:0:')) return
    const f = getBucketFluid(stack, getFullID)
    if (!f) return
    stack.type = 'fluid'
    stack.name = f
    ingr.amount = 1000
  })
}

const removeByPredicate = (
  items: JEIESlot[],
  predicate: (s: JEIEItem) => boolean
) => {
  items.splice(
    items.findIndex((o) => o.stacks.some(predicate)),
    1
  )
}

const removeByNameStarts = (items: JEIESlot[], name: string) => {
  return removeByPredicate(items, (s) => s.name.startsWith(name))
}

// Clear recipes for this entries
adapters.set(
  new RegExp(
    'EIOTank' +
      '|GENDUSTRY_SAMPLER' +
      '|GENDUSTRY_MUTATRON' +
      '|GENDUSTRY_REPLICATOR' +
      '|jei__information' +
      '|jeresources__worldgen' +
      '|petrified__burn__time' +
      '|thermalexpansion__transposer__extract' +
      '|thermalexpansion__transposer__fill' +
      '|ftbquests__lootcrates' +
      '|ftbquests__quests' +
      '|xu2__machine__extrautils2__generator__culinary'
  ),
  (cat) => (cat.recipes = [])
)

// Take only first item as catalyst blacklist
adapters.set(
  /^(?!.*(extendedcrafting__ender_crafting|iceandfire__(fire|ice)_dragon_forge))/,
  (cat) => {
    cat.catalysts = cat.catalysts.slice(0, 1)
  }
)

adapters.set(/iceandfire__(fire|ice)_dragon_forge/, (cat) => {
  cat.catalysts = [cat.catalysts[1]]
})

adapters.set(/minecraft__crafting/, (cat, tools) => {
  // Remove useless jetpack recipes
  cat.recipes = cat.recipes.filter(
    (rec) =>
      !rec.input.items.some((item) =>
        item.stacks.some((stack) => stack.name === 'ic2:jetpack_electric:0')
      )
  )

  // Set empty catalyst if crafting table not necessary
  const crTable = getIngr('minecraft:crafting_table:0')
  cat.recipes = cat.recipes.map((rec) => {
    const [x, y] = (['x', 'y'] as const).map((k) =>
      rec.input.items.filter((s) => s.stacks.length).map((s) => s[k])
    )
    const isSimple = max(max(...x) - min(...x), max(...y) - min(...y)) <= 18
    return Object.assign(rec, { catalyst: isSimple ? [] : [crTable] })
  })

  cat.recipes.forEach((rec) => {
    rec.input.items.forEach((slot) => {
      if (slot.stacks[0]?.name === 'minecraft:milk_bucket:0') {
        // Items that give back
        rec.output.items.push(getSlot('minecraft:bucket:0'))
      } else {
        // Change amount of tool ingredients
        slot.stacks.some((stack) => {
          if (stack.type !== 'item') return false
          const def = stack.name.split(':').slice(0, 2).join(':')
          const durab = tools.toolDurability[def]
          if (!durab) return false
          slot.amount = 1 / durab
          slot.stacks = [stack]
          return true
        })
      }
    })
  })
})

adapters.set(/tconstruct__casting_table/, (cat) => {
  const catalyst = [
    getIngr('tconstruct:casting:0'),
    getIngr('tconstruct:casting:1'),
  ]
  cat.catalysts = catalyst.map((g) => g.stacks[0])

  cat.recipes.forEach((rec: JEIECustomRecipe) => {
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
        rec.catalyst = [...catalyst, getIngr(castOnTable.name)]
      }
      return
    }
  })
})

adapters.set(/tconstruct__smeltery/, (cat) => {
  cat.catalysts = getIngr('tconstruct:smeltery_controller:0').stacks

  cat.recipes.forEach((rec) => {
    rec.output.items = [rec.output.items[0]]
  })
})

adapters.set(/tconstruct__alloy/, (cat) => {
  cat.catalysts = getIngr('tconstruct:smeltery_controller:0').stacks
})

adapters.set(/minecraft__brewing/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items.splice(0, 2)
    rec.input.items[0].amount = 3
    rec.output.items[0].amount = 3
  })
})

adapters.set(/tinkersjei__tool_stats/, (cat) => {
  const catalyst = [getIngr('tconstruct:tooltables:3')]

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
              input: { items: [input as JEIESlot] },
              output: { items: [{ ...slot, stacks: [ingr] }] },
              catalyst,
            })
          )
      })
    })
  cat.recipes = newRecipes
})

adapters.set(/machine_produce_category/, (cat, tools) => {
  const convertBucket = (slot: JEIESlot) => bucketToFluid(slot, tools.getFullID)
  cat.recipes = cat.recipes.map((rec) => {
    const machine = rec.input.items[0]
    rec.input.items = [
      {
        ...machine,
        amount: 20000,
        stacks: [{ type: 'placeholder', name: 'rf' }],
      },
    ]
    rec.output.items.forEach(convertBucket)
    return Object.assign(rec, { catalyst: [machine] })
  })
})

adapters.set(
  /thermalexpansion__sawmill_tapper|thermalexpansion__furnace_pyrolysis/,
  (cat) => {
    cat.recipes.forEach((rec) => {
      rec.input.items = rec.input.items.filter(
        (slot) =>
          slot.stacks[0].type !== 'fluid' ||
          (rec.output.items.push(slot), false)
      )
    })
  }
)

adapters.set(/blockdrops/, (cat, tools) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    const toolId = tools.getTool(rec.input.items[0].stacks[0].name)
    rec.catalyst = toolId ? [getIngr(toolId)] : []
  })
})

adapters.set(/tubing/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items.shift()
  })
})

adapters.set(/^recycler$/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items[0].stacks = getIngr('minecraft:stone:0').stacks
  })
})

adapters.set(/extendedcrafting__compressor/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    if (rec.input.items.length >= 2)
      rec.catalyst = [rec.input.items.pop() as JEIESlot]
    rec.input.items[0].amount = 10000
  })
})

adapters.set(/forestry__fabricator/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    const slot = rec.input.items.find((slot) => slot.x === 118 && slot.y === 0)
    if (slot) slot.amount = rec.output.items[0].amount / 33 // TODO max durability
  })
})

adapters.set(/thermalexpansion__transposer_(extract|fill)/, (cat) => {
  cat.recipes = cat.recipes.filter(
    (rec) => !rec.output.items.some((slot) => slot.stacks.length > 10)
  )
})

adapters.set(/^THAUMCRAFT_.+/, (cat, tools) => {
  cat.recipes.forEach((rec) => {
    ;[...rec.input.items, ...rec.output.items].forEach((slot) =>
      slot.stacks.forEach((stack) => {
        if (stack.name.startsWith('thaumcraft:crystal_essence:0:'))
          stack.name = tools
            .getFullID(stack)
            .replace(
              /thaumcraft:crystal_essence:0:\{Aspects:\[\{key:"([^"]+)",amount:(\d+)\}\]\}/,
              'thaumcraft:crystal_essence:0:{Aspects:[{amount:$2,key:"$1"}]}'
            )
      })
    )
  })
})

adapters.set(/THAUMCRAFT_ASPECT_FROM_ITEMSTACK/, (cat) => {
  interface AmountAspect {
    amount: number
    aspect: string
  }

  // Items that should not be used as aspect sources
  const inputBlacklist = [
    'minecraft:spawn_egg:0',
    'conarm:boots:0',
    'conarm:helmet:0',
    'conarm:leggings:0',
    'conarm:chestplate:0',
    'conarm:chestplate:0',
    'tcomplement:sledge_hammer:0',
    'minecraft:potion:0',
    'mekanism:gastank:0',
    'astralsorcery:itemtunedrockcrystal:0',
  ]

  /**
   * ItemID: Aspects output
   */
  const itemMap = new Map<string, AmountAspect[]>()
  cat.recipes.forEach((rec) => {
    rec.input.items.forEach((slot) => {
      const itemId = slot.stacks[0].name
      if (inputBlacklist.some((id) => itemId.startsWith(id))) return

      let arr = itemMap.get(itemId)
      if (!arr) {
        arr = []
        itemMap.set(itemId, arr)
      }
      ;(arr as AmountAspect[]).push({
        amount: slot.amount,
        aspect: rec.output.items[0].stacks[0].name,
      })
    })
  })

  // Create recipes item=>Aspects
  const catal = getIngr('thaumcraft:crucible:0')
  cat.recipes = [...itemMap].map(([id, aspectsArr]) => ({
    input: { items: [{ x: 0, y: 0, ...getIngr(id) }] },
    output: {
      items: aspectsArr.map((asp) => ({
        x: 18,
        y: 0,
        amount: asp.amount,
        stacks: [
          { type: 'thaumcraft.api.aspects.AspectList', name: asp.aspect },
        ],
      })),
    },
    catalyst: [catal],
  }))

  cat.recipes.push(
    ...cat.recipes
      // Only Phials as input
      .filter((rec) =>
        rec.input.items[0].stacks[0].name.startsWith('thaumcraft:phial:1:')
      )
      // Swap phial with output
      .map((rec) => ({
        input: {
          items: rec.output.items.concat(getSlot('thaumcraft:phial:0')),
        },
        output: { items: rec.input.items },
        catalyst: [],
      }))
  )
})

adapters.set(/THAUMCRAFT_ARCANE_WORKBENCH/, (cat) => {
  cat.catalysts = [getIngr('thaumcraft:arcane_workbench:0').stacks[0]]
  cat.recipes.forEach((rec) => {
    rec.input.items.concat(rec.output.items.slice(1))
    rec.output.items = [rec.output.items[0]]
  })
})

adapters.set(/jeresources__dungeon/, (cat) => {
  const catal: JEIEIngredient = {
    stacks: [{ type: 'placeholder', name: 'exploration' }],
    amount: 500000,
  }
  cat.recipes.forEach((rec: JEIECustomRecipe) => (rec.catalyst = [catal]))
})

adapters.set(/jeresources__villager/, (cat) => {
  const newRecipes: JEIECustomRecipe[] = []
  cat.recipes.forEach((rec) => {
    const [input, output] = (['input', 'output'] as const).map((o) =>
      _.sortBy(_.groupBy(rec[o].items, 'y'), 'y')
    )
    input.forEach((inp, y_i) => {
      const out = output[y_i]?.[0]
      if (!out) throw new Error('Villager recipe inconsistency')
      const [aa, bb] = inp
      aa.stacks.forEach((a, j) => {
        const outStack = out.stacks[j] ?? out.stacks[0]
        if (!outStack) throw new Error('Villager recipe inconsistency')
        newRecipes.push({
          input: {
            items: [a, bb.stacks[j]]
              .filter((o) => o.name !== 'minecraft:air:0')
              .map((o) => ({
                x: aa.x,
                y: aa.y,
                amount: aa.amount || 1,
                stacks: [{ type: o.type, name: o.name }],
              })),
          },
          output: {
            items: [
              {
                x: out.x,
                y: out.y,
                amount: out.amount || 1,
                stacks: [{ type: outStack.type, name: outStack.name }],
              },
            ],
          },
          catalyst: [getIngr('placeholder:trade', 100000 + y_i * 10000)],
        })
      })
    })
  })
  cat.recipes = newRecipes
})

adapters.set(
  /mia__orechid_vacuam|botania__orechid_ignem|botania__orechid/,
  (cat) => {
    let inputSlot: JEIESlot | undefined
    const outputs = cat.recipes.map((rec) => {
      const sorted = rec.input.items.sort((a, b) => a.x - b.x)
      inputSlot ??= sorted[0]
      return sorted.pop() as JEIESlot
    })
    ;(inputSlot as JEIESlot).amount = outputs.reduce((a, b) => a + b.amount, 0)
    cat.recipes = [
      { input: { items: [inputSlot as JEIESlot] }, output: { items: outputs } },
    ]
  }
)

adapters.set(
  /inworldcrafting__(burn_item|exploding_blocks|itemtransform|fluid_to_fluid)/,
  (cat) => {
    cat.recipes.forEach((rec) => {
      const sorted = rec.input.items.sort((a, b) => a.x - b.x)
      rec.output.items = [sorted.pop() as JEIESlot]
      rec.input.items = sorted
    })
  }
)

adapters.set(/bonsaitrees__Growing/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items
    rec.input.items = [getSlot('placeholder:ticks', 400)]
    rec.output.items.forEach((stack) => {
      stack.amount *= 5
    })
  })
})

adapters.set(/mekanism__osmiumcompressor/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items = rec.input.items.filter(
      (it) => !it.stacks.some((s) => s.type === 'mekanism.api.gas.GasStack')
    )
  })
})

adapters.set(/exnihilocreatio__compost/, (cat) => {
  cat.recipes.forEach(
    (rec) => (rec.output.items = [getSlot('minecraft:dirt:0')])
  )
})

adapters.set(/exnihilocreatio__hammer/, (cat) => {
  cat.catalysts = getIngr('tcomplement:sledge_hammer:*').stacks
})

adapters.set(
  /exnihilocreatio__fluid_(transform|block_transform|on_top)/,
  (cat, tools) => {
    const convertBucket = (ingr: JEIEIngredient) =>
      bucketToFluid(ingr, tools.getFullID)
    const barrel = getIngr('exnihilocreatio:block_barrel0:0')
    cat.recipes.forEach((rec: JEIECustomRecipe) => {
      rec.input.items = rec.input.items.filter(
        (it) =>
          !it.stacks.some((stack) =>
            stack.name.startsWith('exnihilocreatio:block_barrel')
          )
      )
      const input = rec.input.items.filter((it) => it.x < 74)
      const catals = rec.input.items.filter((it) => it.x === 74)
      rec.input.items = input
      rec.catalyst = [barrel, ...catals]

      rec.input.items.forEach(convertBucket)
      rec.catalyst.forEach(convertBucket)
      rec.output.items.forEach(convertBucket)
    })
  }
)

adapters.set(/minecraft__anvil/, (cat) => {
  cat.recipes = cat.recipes.filter(
    (rec) =>
      !rec.input.items.some((slot) => slot.stacks.length > 1) &&
      !rec.output.items.some((slot) => slot.stacks.length > 1) &&
      !rec.input.items.some((slot) =>
        slot.stacks.some((stack) =>
          stack.name.startsWith('minecraft:enchanted_book:0:')
        )
      )
  )
})

adapters.set(/chisel__chiseling/, (cat) => {
  const catalyst = [getIngr('chisel:chisel_iron:0')]

  const newRecipes: JEIECustomRecipe[] = []
  cat.recipes.forEach((rec) => {
    const inp = rec.input.items[0]
    rec.output.items.forEach((out) => {
      newRecipes.push({
        input: { items: [inp] },
        output: { items: [out] },
        catalyst,
      })
      newRecipes.push({
        input: { items: [out] },
        output: { items: [inp] },
        catalyst,
      })
    })
  })

  cat.recipes = newRecipes
})

adapters.set(/requious__scented_hive/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items.filter(
      (o) =>
        !o.stacks.some(
          (s) =>
            s.name === 'exnihilocreatio:hive:1' ||
            s.name.startsWith('biomesoplenty:earth')
        )
    )
    rec.input.items = [getSlot('exnihilocreatio:hive:1')]
  })
})

adapters.set(/jeresources__mob/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items = [{ x: 0, y: 0, ...getIngr('placeholder:fight', 100000) }]
  })
})

adapters.set(/jeresources__plant/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items
    rec.input.items = [getSlot('placeholder:ticks', 200)]
  })
})

const beeOnlySpecie = (item: JEIEItem, tools: Tools) => {
  const specieGenes = tools
    .getFullID(item)
    .match(/(\{Slot:0b,UID0:"[^"]+")/)?.[1]
  if (!specieGenes) throw new Error('Cant parse bee genes')

  return {
    ...item,
    name: item.name.replace(
      /(forestry:bee_[^:]+:\d+:).+/,
      `$1{Genome:{Chromosomes:[${specieGenes}}]}}`
    ),
  }
}

adapters.set(/bdew__jeibees__mutation__rootBees/, (cat, tools) => {
  cat.recipes
    .filter((rec) =>
      rec.output.items.some((slot) =>
        slot.stacks.some((st) => st.name.startsWith('forestry:bee_queen_ge:0:'))
      )
    )
    .forEach((rec) => {
      rec.input.items.forEach((slot) => {
        slot.stacks = [beeOnlySpecie(slot.stacks[0], tools)]
      })
      const fullId = tools.getFullID(rec.output.items[0].stacks[0])
      const queenGenes = fullId.substring(24).replace(/,\s*Mate:.+/, '}')
      cat.recipes.push({
        input: {
          items: rec.output.items.map((slot) => ({
            ...slot,
            stacks: slot.stacks.map((s) => beeOnlySpecie(s, tools)),
          })),
        },
        output: {
          items: [
            getSlot('forestry:bee_princess_ge:0:' + queenGenes, 1),
            getSlot('forestry:bee_drone_ge:0:' + queenGenes, 4),
          ],
        },
      })
    })
})

adapters.set(/bdew__jeibees__produce__rootBees/, (cat, tools) => {
  const time = getSlot('placeholder:ticks', 2000)
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items.map((s) => ({
      ...s,
      stacks: s.stacks.map((o) => beeOnlySpecie(o, tools)),
    }))
    rec.input.items = [time]
  })
})

adapters.set(/rustic__brewing/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items = rec.input.items.filter(
      (inp) =>
        !rec.output.items.some((out) =>
          out.stacks.some((stack) =>
            inp.stacks.some((s) => s.name === stack.name)
          )
        )
    )
  })
})

// Everything
adapters.set(/.*/, (cat, tools) => {
  const convertBucket = (ingr: JEIESlot) => bucketToFluid(ingr, tools.getFullID)
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach(convertBucket)
  })
})

export default adapters
