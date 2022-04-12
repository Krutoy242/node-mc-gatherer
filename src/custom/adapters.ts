import {
  Ingredient,
  Item,
  JEIECategory,
  JEIECustomRecipe,
  Slot,
} from '../from/jeie/JEIECategory'
const { max, min } = Math

const adapters: Map<
  RegExp,
  (cat: JEIECategory, getFullStack: (ingr: Item) => string) => void
> = new Map()

function getItem(id: string, amount = 1): Ingredient {
  return { amount, stacks: [{ type: 'item', name: id }] }
}

function bucketToFluid(stack: Item, getFullID: (ingr: Item) => string): void {
  if (!stack.name.startsWith('forge:bucketfilled:0:')) return
  const m = getFullID(stack).match(
    /^forge:bucketfilled:0:\{FluidName:"([^"]+)",Amount:1000\}$/
  )
  if (!m) return
  stack.type = 'fluid'
  stack.name = m[1]
}

// Clear recipes for this entries
adapters.set(
  new RegExp(
    'EIOTank' +
      '|GENDUSTRY__SAMPLER' +
      '|jei__information' +
      '|jeresources__villager' +
      '|jeresources__worldgen' +
      '|minecraft__anvil' +
      '|minecraft__brewing' +
      '|petrified__burn__time' +
      '|thermalexpansion__transposer__extract' +
      '|thermalexpansion__transposer__fill' +
      '|xu2__machine__extrautils2__generator__culinary'
  ),
  (cat) => (cat.recipes = [])
)

// Take only first item as catalyst blacklist
adapters.set(
  /^(?!.*(extendedcrafting__ender_crafting|iceandfire__fire_dragon_forge))/,
  (cat) => {
    cat.catalysts = cat.catalysts.slice(0, 1)
  }
)

adapters.set(/iceandfire__fire_dragon_forge/, (cat) => {
  cat.catalysts = [cat.catalysts[1]]
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

  cat.recipes = newRecs
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

  cat.recipes = newRecipes
})

adapters.set(/tconstruct__smeltery/, (cat) => {
  const catalyst = [getItem('tconstruct:smeltery_controller:0')]

  cat.recipes = cat.recipes.map((rec) => {
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
  cat.recipes = newRecipes
})

adapters.set(/machine_produce_category/, (cat, getFullID) => {
  cat.recipes = cat.recipes.map((rec) => {
    const machine = rec.input.items[0]
    rec.input.items = [
      {
        ...machine,
        amount: 20000,
        stacks: [{ type: 'placeholder', name: 'rf' }],
      },
    ]
    rec.output.items.forEach((slot) => {
      slot.stacks.forEach((stack) => {
        bucketToFluid(stack, getFullID)
      })
    })
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

adapters.set(/inworldcrafting__exploding_blocks/, (cat) => {
  cat.recipes.forEach((rec) => {
    rec.output.items = [rec.input.items.pop() as Slot]
  })
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
  const itemMap = new Map<string, AmountAspect[]>()
  cat.recipes.forEach((rec) => {
    rec.input.items.forEach((slot) => {
      const itemId = slot.stacks[0].name
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
  const catal = getItem('thaumcraft:crucible:0')
  cat.recipes = [...itemMap].map(([id, aspectsArr]) => ({
    input: { items: [{ x: 0, y: 0, ...getItem(id) }] },
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
  cat.recipes.forEach((rec) => {
    rec.input.items.concat(rec.output.items.slice(1))
    rec.output.items = [rec.output.items[0]]
  })
})

adapters.set(/chisel__chiseling/, (cat) => {
  const catalyst = [getItem('chisel:chisel_iron:0')]

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
    rec.input.items = [{ x: 0, y: 0, ...getItem('placeholder:fight', 10000) }]
  })
})

// Everything
adapters.set(/.*/, (cat, getFullID) => {
  cat.recipes.forEach((rec: JEIECustomRecipe) => {
    rec.input.items.forEach((slot) => {
      slot.stacks.forEach((stack) => {
        bucketToFluid(stack, getFullID)
      })
    })
  })
})

export default adapters
