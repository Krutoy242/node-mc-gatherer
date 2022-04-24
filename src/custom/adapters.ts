import {
  JEIECategory,
  JEIECustomRecipe,
  JEIEIngredient,
  JEIEItem,
  JEIESlot,
} from '../from/jeie/JEIECategory'
const { max, min } = Math

const adapters: Map<
  RegExp,
  (cat: JEIECategory, getFullStack: (ingr: JEIEItem) => string) => void
> = new Map()

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

// Clear recipes for this entries
adapters.set(
  new RegExp(
    'EIOTank' +
      '|GENDUSTRY__SAMPLER' +
      '|jei__information' +
      '|jeresources__villager' +
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

adapters.set(/minecraft__crafting/, (cat) => {
  let newRecs: JEIECustomRecipe[] = cat.recipes.filter(
    (rec) =>
      !rec.input.items.some((item) =>
        item.stacks.some((stack) => stack.name === 'ic2:jetpack_electric:0')
      )
  )

  const crTable = getIngr('minecraft:crafting_table:0')
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
          ...getIngr('minecraft:bucket:0'),
        })
      }
    })
  })

  cat.recipes = newRecs
})

adapters.set(/tconstruct__casting_table/, (cat) => {
  const catalyst = [
    getIngr('tconstruct:casting:0'),
    getIngr('tconstruct:casting:1'),
  ]

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

adapters.set(/machine_produce_category/, (cat, getFullID) => {
  const convertBucket = (slot: JEIESlot) => bucketToFluid(slot, getFullID)
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

adapters.set(/thermalexpansion__sawmill_tapper/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items = rec.input.items.filter(
      (slot) =>
        slot.stacks[0].type !== 'fluid' || (rec.output.items.push(slot), false)
    )
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

adapters.set(/thermalexpansion__transposer_(extract|fill)/, (cat) => {
  cat.recipes = cat.recipes.filter(
    (rec) => !rec.output.items.some((slot) => slot.stacks.length > 10)
  )
})

adapters.set(/^THAUMCRAFT_.+/, (cat, getFullStack) => {
  cat.recipes.forEach((rec) => {
    ;[...rec.input.items, ...rec.output.items].forEach((slot) =>
      slot.stacks.forEach((stack) => {
        if (stack.name.startsWith('thaumcraft:crystal_essence:0:'))
          stack.name = getFullStack(stack).replace(
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
})

adapters.set(/THAUMCRAFT_ARCANE_WORKBENCH/, (cat) => {
  cat.catalysts = [getIngr('thaumcraft:arcane_workbench:0').stacks[0]]
  cat.recipes.forEach((rec) => {
    rec.input.items.concat(rec.output.items.slice(1))
    rec.output.items = [rec.output.items[0]]
  })
})

adapters.set(/exnihilocreatio__hammer/, (cat) => {
  cat.catalysts = getIngr('tcomplement:sledge_hammer:0').stacks
})

adapters.set(/jeresources__dungeon/, (cat) => {
  const catal: JEIEIngredient = {
    stacks: [{ type: 'placeholder', name: 'placeholder:exploration' }],
    amount: 500000,
  }
  cat.recipes.forEach((rec: JEIECustomRecipe) => (rec.catalyst = [catal]))
})

adapters.set(/exnihilocreatio__compost/, (cat) => {
  cat.recipes.forEach((rec) => (rec.output.items = [getSlot('minecraft:dirt')]))
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
  /inworldcrafting__burn_item|inworldcrafting__exploding_blocks|inworldcrafting__itemtransform/,
  (cat) => {
    cat.recipes.forEach((rec) => {
      const sorted = rec.input.items.sort((a, b) => a.x - b.x)
      rec.output.items = [sorted.pop() as JEIESlot]
      rec.input.items = sorted
    })
  }
)

adapters.set(/mekanism__osmiumcompressor/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items = rec.input.items.filter(
      (it) => !it.stacks.some((s) => s.type === 'mekanism.api.gas.GasStack')
    )
  })
})

adapters.set(
  /exnihilocreatio__fluid_(transform|block_transform)/,
  (cat, getFullID) => {
    const convertBucket = (ingr: JEIEIngredient) =>
      bucketToFluid(ingr, getFullID)
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

adapters.set(/jeresources__mob/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.input.items = [{ x: 0, y: 0, ...getIngr('placeholder:fight', 10000) }]
  })
})

adapters.set(/bdew__jeibees__mutation__rootBees/, (cat, getFullID) => {
  const queensInOut = cat.recipes.filter((rec) =>
    rec.output.items.some((slot) =>
      slot.stacks.some((st) => st.name.startsWith('forestry:bee_queen_ge:0:'))
    )
  )
  queensInOut.forEach((rec) => {
    const fullId = getFullID(rec.output.items[0].stacks[0])
    const queenGenes = fullId.substring(24).replace(/,\s*Mate:.+/, '}')
    const getBee = (n: number, id: string) => ({
      ...getIngr(id + queenGenes, n),
      x: 0,
      y: 0,
    })
    cat.recipes.push({
      input: rec.output,
      output: {
        items: [
          getBee(1, 'forestry:bee_princess_ge:0:'),
          getBee(2, 'forestry:bee_drone_ge:0:'),
        ],
      },
    })
  })

  cat.recipes.forEach((rec) => {
    // Add analyzed / not analyzed bee alternative
    const anyAnalyzed = (it: JEIESlot) => {
      it.stacks = [
        it.stacks[0],
        {
          type: 'item',
          name: it.stacks[0].name.replace(/IsAnalyzed:1b/, 'IsAnalyzed:0b'),
        },
      ]
    }
    rec.input.items.forEach(anyAnalyzed)
    rec.output.items.forEach(anyAnalyzed)
  })
})

// Everything
adapters.set(/.*/, (cat, getFullID) => {
  const convertBucket = (ingr: JEIESlot) => bucketToFluid(ingr, getFullID)
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach(convertBucket)
  })
})

export default adapters
