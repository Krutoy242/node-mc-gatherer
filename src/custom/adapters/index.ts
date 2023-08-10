import _ from 'lodash'

import type {
  JEIECategory,
  JEIECustomRecipe,
  JEIEIngredient,
  JEIEItem,
  JEIESlot,
  List,
} from '../../from/jeie/JEIECategory'

const { max, min } = Math

export interface Tools {
  getFullID: (ingr: JEIEItem) => string
  toolDurability: { [id: string]: number }
  getTool: (blockId: string) => string | undefined
}

const adapters: Map<RegExp, (cat: JEIECategory, tools: Tools) => void>
  = new Map()

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
    if (stack.name.startsWith('minecraft:milk_bucket:0')) return 'milk'
  }

  if (!stack.name.startsWith('forge:bucketfilled:0:')) return
  return getFullID(stack).match(
    /^forge:bucketfilled:0:\{FluidName:"([^"]+)",Amount:1000.*\}$/
  )?.[1]
}

function stackBucketToFluid(
  stack: JEIEItem,
  getFullID: (ingr: JEIEItem) => string
): boolean {
  if (!stack.name.startsWith('forge:bucketfilled:0:')) return false
  const f = getBucketFluid(stack, getFullID)
  if (!f) return false
  stack.type = 'fluid'
  stack.name = f
  return true
}

function bucketToFluid(
  ingr: JEIEIngredient,
  getFullID: (ingr: JEIEItem) => string
): void {
  ingr.stacks.forEach((stack) => {
    if (stackBucketToFluid(stack, getFullID)) ingr.amount = 1000
  })
}

type MovePredicate = (s: JEIESlot) => boolean
function moveFromToList(
  rec: JEIECustomRecipe,
  fromName: keyof Omit<JEIECustomRecipe, 'catalyst'>,
  toName: keyof JEIECustomRecipe,
  predicate?: MovePredicate
) {
  const isToCatal = toName === 'catalyst'

  if (!predicate) {
    if (isToCatal) rec[toName] = rec[fromName].items
    else rec[toName].items = rec[fromName].items
    rec[fromName].items = []
    return
  }

  if (isToCatal) rec[toName] ??= []
  else rec[toName].items ??= []

  const list = isToCatal ? rec[toName] : rec[toName].items
  list!.push(...rec[fromName].items.filter(s => predicate(s)))
  rec[fromName].items = rec[fromName].items.filter(s => !predicate(s))
}

const move = {
  input: {
    to: {
      output  : (rec: JEIECustomRecipe, p?: MovePredicate) => moveFromToList(rec, 'input', 'output', p),
      catalyst: (rec: JEIECustomRecipe, p?: MovePredicate) => moveFromToList(rec, 'input', 'catalyst', p),
    },
  },
  output: {
    to: {
      input   : (rec: JEIECustomRecipe, p?: MovePredicate) => moveFromToList(rec, 'output', 'input', p),
      catalyst: (rec: JEIECustomRecipe, p?: MovePredicate) => moveFromToList(rec, 'output', 'catalyst', p),
    },
  },
}

// Clear recipes for this entries
adapters.set(
  new RegExp(
    'GENDUSTRY_SAMPLER'
      + '|^GENDUSTRY_MUTATRON$'
      + '|^GENDUSTRY_REPLICATOR$'
      + '|^jei__information$'
      + '|^jeresources__worldgen$'
      + '|^petrified__burn__time$'
      + '|^ftbquests__lootcrates$'
      + '|^ftbquests__quests$'
      + '|^xu2__machine__extrautils2__generator__.*'
      + '|^flux$'
  ),
  cat => (cat.recipes = [])
)

adapters.set(/minecraft__crafting/, (cat, tools) => {
  // Remove useless jetpack recipes
  cat.recipes = cat.recipes.filter(
    rec =>
      // TODO: Remove this temporary recipe avoiding
      !rec.output.items.some(item => item.stacks.some(stack => stack.name === 'tconstruct:shard:0'))
      && !rec.input.items.some(item => item.stacks.some(stack => stack.name === 'ic2:jetpack_electric:0'))
  )

  // Set empty catalyst if crafting table not necessary
  const crTable = getIngr('minecraft:crafting_table:0')
  cat.recipes = cat.recipes.map((rec) => {
    const [x, y] = (['x', 'y'] as const).map(k =>
      rec.input.items.filter(s => s.stacks.length).map(s => s[k])
    )
    const isSimple = max(max(...x) - min(...x), max(...y) - min(...y)) <= 18
    return Object.assign(rec, { catalyst: isSimple ? [] : [crTable] })
  })

  cat.recipes.forEach((rec) => {
    rec.input.items.forEach((slot) => {
      // Change amount of tool ingredients
      slot.stacks.some((stack) => {
        if (stack.type !== 'item' && stack.type !== 'oredict') return false
        const def = stack.type === 'oredict'
          ? `ore:${stack.name}`
          : stack.name.split(':').slice(0, 2).join(':')
        const durab = tools.toolDurability[def]
        if (!durab) return false
        slot.amount = 1 / durab
        slot.stacks = [stack]
        return true
      })

      // Unify fluid containers and NBTed items
      if (slot.stacks.length > 20) {
        const splitted = slot.stacks.map((item) => {
          const split = item.name.split(':')
          return { item, id_meta: split.slice(0, 3).join(':'), nbtHash: split.slice(3).join(':') }
        })
        for (const [id_meta, g] of Object.entries(_.groupBy(splitted, s => s.id_meta))) {
          if (g.length < 20 || g.filter(i => i.nbtHash).length < 19) continue
          slot.stacks = slot.stacks.filter(s => !s.name.startsWith(id_meta))
          slot.stacks.push({ name: id_meta, type: 'item' })
        }
      }
    })

    // Convert buckets in output to liquids (inputs converted later)
    rec.output.items.forEach(ingr => bucketToFluid(ingr, tools.getFullID))
  })
})

adapters.set(/tconstruct__casting_table/, (cat, tools) => {
  cat.catalysts = [
    getIngr('tconstruct:casting:0'),
    getIngr('tconstruct:casting:1'),
  ].map(g => g.stacks[0])

  const notConsumed = [
    'tcomplement:cast:',
    'tconstruct:cast:',
    'tconstruct:cast_custom:',
  ]
  const anyCast = notConsumed.concat('tconstruct:clay_cast')

  const nameCache = new Map<string, string>()

  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    // Remove Duplicate of input liquid
    rec.input.items.some((s, i) => s.stacks.some(item => item.type === 'fluid') && rec.input.items.splice(i, 1))

    rec.input.items.forEach((slot, i) => {
      // Cast is reusable, move it to catalysts
      const cast = slot.stacks[0]
      if (
        cast
        && cast.type === 'item'
        && notConsumed.some(c => cast.name.startsWith(c))
      ) {
        rec.input.items.splice(i, 1)
        rec.catalyst = [{ amount: 1, stacks: cat.catalysts }, getIngr(cast.name)]
      }
    })

    // Instead of iterating all possible tool parts, use only wooden/string
    if (rec.output.items.some(s => s.stacks.some(i => anyCast.some(c => i.name.startsWith(c))))) {
      rec.input.items.forEach((inp) => {
        if (inp.stacks.length <= 1) return

        // Find all possible materials
        const materials = new Map<string, string>()
        inp.stacks.forEach((s) => {
          if (nameCache.has(s.name)) return
          const full = tools.getFullID(s)
          nameCache.set(s.name, full)
          const m = full.match(/Material:"(.+?)"/)?.[0]
          if (m) materials.set(m, s.name)
        })

        // Replace with only one item ingredient
        for (const mat of ['wood', 'string', 'stone']) {
          if (!materials.has(mat)) continue
          inp.stacks = [{ type: inp.stacks[0].type, name: materials.get(mat) as string }]
          return
        }
      })
    }
  })
})

adapters.set(/tconstruct__smeltery/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.output.items = [rec.output.items[0]]
  })
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
      rec =>
        !rec.input.items.some(slot =>
          slot.stacks.some(ingr => ingr.type === 'fluid')
        )
    )
    .forEach((rec) => {
      const input = rec.input.items.find(slot => slot.x <= 64)
      if (!input) throw new Error('Cannot find input for Tinker\'s Tool')

      rec.input.items.forEach((slot) => {
        if (slot.x > 64) {
          slot.stacks.forEach(ingr =>
            newRecipes.push({
              input : { items: [input as JEIESlot] },
              output: { items: [{ ...slot, stacks: [ingr] }] },
              catalyst,
            })
          )
        }
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
        slot =>
          slot.stacks[0].type !== 'fluid'
          || (rec.output.items.push(slot), false)
      )
    })
  }
)

adapters.set(/thermalexpansion__charger/, (cat) => {
  // Filter all recipes that output same item (only NBT changed)
  cat.recipes = cat.recipes.filter((rec: JEIECustomRecipe) => {
    const defMeta = (l: List) => l.items.map(s => s.stacks.map(d => d.name.split(':').slice(0, 3).join(':'))).flat()
    const outs = defMeta(rec.output)
    return !defMeta(rec.input).some(a => outs.includes(a))
  })
})

adapters.set(/thermalexpansion__insolator$/, (cat) => {
  // All recipes added by insolator should be duplicated as natural growing
  const clearRecipes: JEIECustomRecipe[] = []
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    // This recipe with t1 fertilizer
    if (!rec.input.items.some(s => s.stacks.some(i => i.name === 'thermalfoundation:fertilizer:0'))) return

    // This recipe have same item in input and output
    let name: string | undefined
    rec.input.items.some(s => s.amount === 1 && s.stacks.some(i => rec.output.items.some(t => t.amount === 1 && t.stacks.some(j => (
      i.name === j.name && (name = i.name, true)
    )))))
    if (!name) return

    clearRecipes.push({
      input: {
        items: rec.input.items.filter(s => !s.stacks.some(i =>
          i.name === name
        || i.name === 'thermalfoundation:fertilizer:0'
        || i.name === 'water'
        )).concat([
          getSlot('placeholder:ticks', 500),
        ]),
      },
      output  : { items: rec.output.items.filter(s => !s.stacks.some(i => i.name === name)) },
      catalyst: [getIngr(name)],
    })
  })
  cat.recipes.push(...clearRecipes)
})

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
      rec.catalyst = [{ amount: 1, stacks: cat.catalysts }, rec.input.items.pop() as JEIESlot]
    rec.input.items[0].amount = 10000
  })
})

adapters.set(/forestry__fabricator/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    const slot = rec.input.items.find(slot => slot.x === 118 && slot.y === 0)
    if (slot) slot.amount = rec.output.items[0].amount / 33 // TODO max durability
    rec.input.items.forEach((s) => {
      if (s.stacks.some(i => i.name === 'glass')) {
        s.stacks = [{ type: 'item', name: 'minecraft:sand:0' }]
        s.amount = s.amount / 1000
      }
    })
  })
})

adapters.set(/forestry__squeezer/, (cat) => {
  const blacklistInputs = [
    'forestry:can:1:',
    'forestry:capsule:1:',
    'forestry:refractory:1:',
  ]
  cat.recipes = cat.recipes.filter(
    rec =>
      !rec.input.items.some(slot =>
        slot.stacks.some(stack =>
          blacklistInputs.some(ignore => stack.name.startsWith(ignore))
        )
      )
  )
})

adapters.set(/thermalexpansion__transposer_(extract|fill)/, (cat) => {
  cat.recipes = cat.recipes.filter(
    rec => !rec.output.items.some(slot => slot.stacks.length > 10)
  )
})

adapters.set(/^THAUMCRAFT_.+/, (cat, tools) => {
  cat.recipes.forEach((rec) => {
    [...rec.input.items, ...rec.output.items].forEach(slot =>
      slot.stacks.forEach((stack) => {
        if (stack.name.startsWith('thaumcraft:crystal_essence:0:')) {
          stack.name = tools
            .getFullID(stack)
            .replace(
              /thaumcraft:crystal_essence:0:\{Aspects:\[\{key:"([^"]+)",amount:(\d+)\}\]\}/,
              'thaumcraft:crystal_essence:0:{Aspects:[{amount:$2,key:"$1"}]}'
            )
        }
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
    'astralsorcery:itemtunedrockcrystal:0',
    'conarm:boots:0',
    'conarm:chestplate:0',
    'conarm:chestplate:0',
    'conarm:helmet:0',
    'conarm:leggings:0',
    'forestry:can:1:',
    'forestry:capsule:1:',
    'forestry:refractory:1:',
    'mekanism:gastank:0',
    'minecraft:potion:0',
    'minecraft:spawn_egg:0',
    'tcomplement:sledge_hammer:0',
  ]

  /**
   * ItemID: Aspects output
   */
  const itemMap = new Map<string, AmountAspect[]>()
  cat.recipes.forEach((rec) => {
    rec.input.items.forEach((slot) => {
      const itemId = slot.stacks[0].name
      if (inputBlacklist.some(id => itemId.startsWith(id))) return

      let arr = itemMap.get(itemId)
      if (!arr) {
        arr = []
        itemMap.set(itemId, arr)
      }
      (arr as AmountAspect[]).push({
        amount: slot.amount,
        aspect: rec.output.items[0].stacks[0].name,
      })
    })
  })

  // Create recipes item=>Aspects
  const catal = getIngr('thaumcraft:crucible:0')
  cat.recipes = [...itemMap].map(([id, aspectsArr]) => ({
    input : { items: [{ x: 0, y: 0, ...getIngr(id) }] },
    output: {
      items: aspectsArr.map(asp => ({
        x     : 18,
        y     : 0,
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
      .filter(rec =>
        rec.input.items[0].stacks[0].name.startsWith('thaumcraft:phial:1:')
      )
      // Swap phial with output
      .map(rec => ({
        input: {
          items: rec.output.items.concat(getSlot('thaumcraft:phial:0')),
        },
        output  : { items: rec.input.items },
        catalyst: [],
      }))
  )
})

adapters.set(/THAUMCRAFT_ARCANE_WORKBENCH/, (cat) => {
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
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = [catal]
    rec.input = { items: [{ x: 0, y: 0, ...getIngr('placeholder:exploration', 20000) }] }
  })
})

adapters.set(/jeresources__villager/, (cat) => {
  const newRecipes: JEIECustomRecipe[] = []
  cat.recipes.forEach((rec) => {
    const [input, output] = (['input', 'output'] as const).map(o =>
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
              .filter(o => o.name !== 'minecraft:air:0')
              .map(o => ({
                x     : aa.x,
                y     : aa.y,
                amount: aa.amount || 1,
                stacks: [{ type: o.type, name: o.name }],
              })),
          },
          output: {
            items: [
              {
                x     : out.x,
                y     : out.y,
                amount: out.amount || 1,
                stacks: [{ type: outStack.type, name: outStack.name }],
              },
            ],
          },
          catalyst: [getIngr('placeholder:trade', 10 + y_i ** 2)],
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

adapters.set(/botania__manaPool/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items = rec.input.items.filter(s => !s.stacks.some(i => i.name.startsWith('botania:pool')))
  })
})

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
      it => !it.stacks.some(s => s.type === 'mekanism.api.gas.GasStack')
    )
  })
})

adapters.set(/exnihilocreatio__sieve/, (cat) => {
  cat.recipes.forEach(rec =>
    move.input.to.catalyst(rec, s => s.stacks.some(i => i.name.startsWith('exnihilocreatio:item_mesh')))
  )
})

adapters.set(/exnihilocreatio__compost/, (cat) => {
  const newRecipes: JEIECustomRecipe[] = []
  cat.recipes.forEach((rec) => {
    rec.input.items.forEach((slot) => {
      newRecipes.push({
        output: { items: [getSlot('minecraft:dirt:0')] },
        input : { items: [slot] },
      })
    })
  }
  )
  cat.recipes = newRecipes
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
        it =>
          !it.stacks.some(stack =>
            stack.name.startsWith('exnihilocreatio:block_barrel')
          )
      )
      const input = rec.input.items.filter(it => it.x < 74)
      const catals = rec.input.items.filter(it => it.x === 74)
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
    rec =>
      !rec.input.items.some(slot => slot.stacks.length > 1)
      && !rec.output.items.some(slot => slot.stacks.length > 1)
      && !rec.input.items.some(slot =>
        slot.stacks.some(stack =>
          stack.name.startsWith('minecraft:enchanted_book:0:')
        )
      )
  )
})

adapters.set(/chisel__chiseling/, (cat) => {
  cat.recipes.forEach((rec) => {
    const ids = [
      ...new Set([rec.output.items, rec.input.items]
        .flat()
        .map(s => s.stacks.map(i => `${i.type}::${i.name}`))
        .flat()
      )]

    const stacks = ids.map((tuple) => {
      const o = tuple.split('::')
      return ({ type: o[0] as JEIEItem['type'], name: o[1] })
    })
    rec.input.items = [{ x: 0, y: 0, amount: 1, stacks }]
    rec.output.items = [{ x: 20, y: 0, amount: 1, stacks }]
  })
})

adapters.set(/requious__scented_hive/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items.filter(
      o =>
        !o.stacks.some(
          s =>
            s.name === 'exnihilocreatio:hive:1'
            || s.name.startsWith('biomesoplenty:earth')
        )
    )
    rec.input.items = [getSlot('exnihilocreatio:hive:1')]
  })
})

adapters.set(/requious__ic2_crops/, (cat, tools) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach((slot) => {
      // Remove glyphs
      slot.stacks = slot.stacks.filter(stack => !stack.name.startsWith('openblocks:glyph'))
      slot.stacks.forEach((stack) => {
        if (stack.name.split(':').length <= 3) return
        // Remove Display tags
        stack.name = tools.getFullID(stack).replace(/,display:\{[^}]+\}/, '')
      })
    })
  })
})

adapters.set(/^ic2__scrapbox$/, (cat) => {
  cat.recipes = [{
    input : { items: [{ amount: cat.recipes.length, x: 0, y: 0, stacks: [{ name: 'ic2:crafting:24', type: 'item' }] }] },
    output: { items: cat.recipes.map(r => r.input.items[1]) },
  }]
})

adapters.set(/requious__liquid_interaction/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    move.input.to.catalyst(rec)
    rec.input.items = [getSlot('placeholder:ticks', 10)]
  })
})

adapters.set(/requious__expire_in_block/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    move.input.to.catalyst(rec, s => s.x === 18)
  })
})

adapters.set(/requious__nether_portal_spread/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    const single = rec.input.items[0]
    single.stacks.push(...rec.input.items.slice(1).map(s => s.stacks).flat())
    rec.input.items = [single]
  })
})

adapters.set(/^requious__.*/, (cat, tools) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    [...rec.input.items, ...rec.output.items, ...rec.catalyst ?? []].forEach((slot) => {
      slot.stacks.forEach((stack) => {
        if (!stack.name.startsWith('draconicevolution:mob_soul:0:')) return
        const entityName = tools.getFullID(stack).match(/EntityName:"([^"]+)"/)![1]
        stack.name = `entity:${entityName}`
      })
    })

    if (!rec.input.items.length) rec.input.items = [getSlot('placeholder:ticks', 2000)]
  })
})

adapters.set(/requious__barrel_milking/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    move.input.to.catalyst(rec)
    rec.input.items = [getSlot('placeholder:ticks', 20)]
  })
})

adapters.set(/jeresources__mob/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items = [{ x: 0, y: 0, ...getIngr('placeholder:fight', 200000) }]
  })
})

adapters.set(/jeresources__plant/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items
    rec.input.items = [getSlot('placeholder:ticks', 200)]
  })
})

function getSpecie(item: JEIEItem, tools: Tools) {
  const specieGenes = tools
    .getFullID(item)
    .match(/(\{Slot:0b,UID0:"[^"]+")/)?.[1]
  if (!specieGenes) throw new Error('Cant parse bee genes')
  return specieGenes
}

function getItemWithSpecie(id: string, specieGenes: string): JEIEItem {
  return {
    type: 'item',
    name: `${id}:{Genome:{Chromosomes:[${specieGenes}}]}}`,
  }
}

function getBeeWithSpecie(name: string, specieGenes: string): JEIEItem {
  return getItemWithSpecie(
    name.match(/^(forestry:bee_[^:]+:\d+):.+/)?.[1] ?? '',
    specieGenes
  )
}
function beeOnlySpecie(item: JEIEItem, tools: Tools) {
  return getBeeWithSpecie(item.name, getSpecie(item, tools))
}

adapters.set(/bdew__jeibees__mutation__rootBees/, (cat, tools) => {
  // Add bee mutations

  const uniqSpecies = new Set<string>()
  cat.recipes
    // Iterate only recipes with queens in output
    .filter(rec =>
      rec.output.items.some(slot =>
        slot.stacks.some(st => st.name.startsWith('forestry:bee_queen_ge:0:'))
      )
    )
    .forEach((rec) => {
      const species = rec.input.items.map(slot =>
        getSpecie(slot.stacks[0], tools)
      )
      rec.input.items.forEach((slot, i) => {
        uniqSpecies.add(species[i])
        slot.stacks = [getBeeWithSpecie(slot.stacks[0].name, species[i])]
      })
      const fullId = tools.getFullID(rec.output.items[0].stacks[0])
      const queenGenes = fullId.substring(24).replace(/,\s*Mate:.+/, '}')

      // Add Queen => Princess + Drone
      const queenItems = rec.output.items.map(slot => ({
        ...slot,
        stacks: slot.stacks.map(s => beeOnlySpecie(s, tools)),
      }))
      cat.recipes.push({
        input : { items: queenItems },
        output: {
          items: [
            getSlot(`forestry:bee_princess_ge:0:${queenGenes}`, 1),
            getSlot(`forestry:bee_drone_ge:0:${queenGenes}`, 4),
          ],
        },
      })

      // Duplicate recipe by swapping Drone + Princess genes in inputs
      cat.recipes.push({
        input: {
          items: [
            getSlot(
              getItemWithSpecie('forestry:bee_princess_ge:0', species[1]).name
            ),
            getSlot(
              getItemWithSpecie('forestry:bee_drone_ge:0', species[0]).name
            ),
          ],
        },
        output: { items: queenItems },
      })
    })
})

adapters.set(/bdew__jeibees__produce__rootBees/, (cat, tools) => {
  const time = getSlot('placeholder:ticks', 2000)
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items.map(s => ({
      ...s,
      stacks: s.stacks.map(o => beeOnlySpecie(o, tools)),
    }))
    rec.input.items = [time]
  })
})

adapters.set(/rustic__brewing/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items = rec.input.items.filter(
      inp =>
        !rec.output.items.some(out =>
          out.stacks.some(stack =>
            inp.stacks.some(s => s.name === stack.name)
          )
        )
    )
  })
})

adapters.set(/GENDUSTRY_/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach((slot) => {
      // Replace wildcarded bees
      if (slot.stacks.length < 20) return
      const splitted = slot.stacks.map(s => s.name.split(':', 4))
      if (splitted.some(s => s.length < 4)) return
      const uniqNoNbt = new Set(splitted.map(s => `${s[0]}:${s[1]}:*`))
      slot.stacks = [...uniqNoNbt].map(name => ({
        type: slot.stacks[0].type,
        name,
      }))
    })
  })
})

adapters.set(/jetif/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    // If we have no fluid output - this recipe not consume fluid
    if (!rec.output.items.some(slot => slot.stacks.some(s => s.type === 'fluid'))) {
      const isFluid = (slot: JEIESlot) => slot.stacks.some(s => s.type === 'fluid')
      move.input.to.catalyst(rec, isFluid)
    }
  })
})

adapters.set(/mysticalagradditions__tier_6_crop_jei/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items = rec.input.items.filter(slot => !slot.stacks.some(stack => stack.name.endsWith('_crop:0')))
  })
})

adapters.set(/nuclearcraft_collector/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.catalyst = rec.input.items
    rec.input.items = [getSlot('placeholder:ticks', 1000)]
  })
})

adapters.set(/^qmd__atmosphere_collector$/, (cat) => {
  cat.recipes = [{
    input : { items: [getSlot('placeholder:ticks', 40)] },
    output: { items: cat.recipes[0].output.items },
  }]
})

adapters.set(/^qmd__accelerator_source$/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach(s => s.amount = 0.001)
  })
})

adapters.set(/astralsorcery__lightTransmutation/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => rec.catalyst = [
    {
      amount: 1,
      stacks: [
        { type: 'item', name: 'astralsorcery:blocklens:*' },
        { type: 'item', name: 'astralsorcery:blockcollectorcrystal:*' },
      ],
    },
    { amount: 1, stacks: [{ type: 'item', name: 'astralsorcery:itemlinkingtool:*' }] },
  ])
})

adapters.set(/embers__melter|embers__geologic_separator/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    const predicate = (s: JEIESlot) => s.stacks.some(i => i.type === 'fluid')
    rec.output.items = rec.input.items.filter(predicate)
    rec.input.items = rec.input.items.filter(s => !predicate(s))
  })
})

adapters.set(/^electrolyzer$/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    move.input.to.output(rec, s => s.y < 10)
  })
})

adapters.set(/^infinityPowder$/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items = [getSlot('placeholder:ticks', 400)]
  })
})

adapters.set(/^it__electrolyticCrucibleBattery$/, (cat) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    move.output.to.input(rec, s => s.x < 20)
  })
})

adapters.set(/^EIOTank$/, (cat) => {
  cat.recipes.forEach((rec) => {
    if (rec.output.items.some(s => s.x >= 100 && s.stacks.length))
      move.output.to.input(rec, s => s.stacks.some(i => i.type === 'fluid'))
  })
})

adapters.set(/^tweakedpetrol.+__pumpjack$/, (cat) => {
  cat.recipes = cat.recipes.filter(r => r.input.items.some(s => s.stacks.some(i => i.name.match(/oil|lava|water/))))
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.output.items.forEach(s => s.amount = 1000)
    rec.input.items = [getSlot('placeholder:ticks', 200)]
  })
})

adapters.set(/^tweakedexcavation__excavator$/, (cat) => {
  cat.catalysts.push({ name: 'dimension:0', type: 'item' })
  cat.recipes.forEach(r => r.input.items = [getSlot('placeholder:ticks', 80), getSlot('placeholder:rf', 1280000)])
})

adapters.set(/^tweakedexcavation__excavator$/, (cat) => {
  cat.recipes.forEach(r => r.input.items.forEach((s) => {
    if (s.stacks.some(i => i.name === ('harvestcraft:queenbeeitem:0')))
      s.amount = 1 / 38
  }))
})

adapters.set(/^appliedenergistics2__inscriber$/, (cat) => {
  cat.recipes.forEach((rec) => {
    move.input.to.catalyst(rec, s => s.stacks.some(i => i.name.match(/appliedenergistics2:material:(13|14|15|19|21).*/)))
  })
})

adapters.set(/^ie__workbench$/, (cat) => {
  cat.recipes.forEach(r => move.input.to.catalyst(r, s => s.stacks.some(i => i.name.startsWith('immersiveengineering:blueprint'))))
})

// Everything
adapters.set(/.*/, (cat, tools) => {
  const convertBucket = (ingr: JEIESlot) => bucketToFluid(ingr, tools.getFullID)
  cat.catalysts.forEach(it => stackBucketToFluid(it, tools.getFullID))
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach(convertBucket)

    rec.output.items.forEach((slot) => {
      for (const stack of slot.stacks) {
        if (stack.name.startsWith('minecraft:air')) {
          slot.stacks = []
          break
        }
      }
    })
  })

  // Replace all soul ingredients with entity
  const mobCap = 'draconicevolution:mob_soul:0:'
  ;[cat.catalysts, cat.recipes.flatMap(r => [r.input.items, r.output.items].flat().flatMap(s => s.stacks))]
    .flat()
    .forEach((it) => {
      if (it.name.startsWith(mobCap)) {
        const full = tools.getFullID(it)
        it.name = `entity:${full.substring(mobCap.length + 13, full.length - 2)}`
      }
    })
})

export default adapters
