type NBTPrimitive = string | number
type NBTValue = NBTPrimitive | NBTMap

export interface NBTMap {
  [key: string]: NBTValue | NBTValue[]
}

export type NBT = '*' | NBTMap

interface NonEmptyArray<T> extends Array<T> {
  // would need to implement all relevant functions.
  pop: () => T
  slice: (...args: any) => NonEmptyArray<T>
}

export function parseSNbt(sNbt?: string): NBT | null {
  if (!sNbt || sNbt === '{}')
    return null
  if (sNbt === '*')
    return '*'
  const pure = sNbt
    .replace(
      /\[[ILBbsfd];((,?-?\d+(\.\d+)?(E-?\d+)?[ILBbsfd]?)*)\]/g,
      (_m, a) => `[${a.replace(/(-?\d+(\.\d+)?(E-?\d+)?)[ILBbsfd]/g, '$1')}]`,
    ) // Remove list types
    .replace(/([{,])([-\w.]+):(?=[-"\d[{\\])/g, '$1"$2":') // Encapsulate keys
    .replace(/(":-?\d+(\.\d+)?(E-?\d+)?)[ILBsfd](?=\W)/gi, '$1')

  try {
    return JSON.parse(pure)
  }
  catch (e) {
    throw new Error(`erroring NBT :>> ${pure}`)
  }
}

export function nbtMatch(A: NBTMap, B?: NBTMap | null): boolean {
  if (!B)
    return false

  for (const k in A) {
    const a = A[k]
    const b = B[k]

    // No key on b
    if (a && !b)
      return false

    // Values same
    if (a === b)
      continue

    // Types mismatch
    if (typeof a !== typeof b)
      return false

    if (Array.isArray(a)) {
      // Both arrays
      if (!compareArrays(a, b as typeof a))
        return false
    }
    else {
      // Maps
      if (typeof a === 'object')
        return nbtMatch(a, b as NBTMap)

      // Primitive value, but not equal
      return false
    }
  }

  return true
}

function compareArrays(A: NBTValue[], B: NBTValue[]): boolean {
  if (A.length > B.length)
    return false
  if (A.length === 0)
    return true

  if (typeof A[0] === 'object')
    return compareObjectArrays(A as any, B as any)

  const A_ = A as NBTPrimitive[]
  const B_ = B as NBTPrimitive[]

  return A_.every((v, i) => B_[i] === v)
}

function compareObjectArrays(
  A: NonEmptyArray<NBTMap>,
  B: NonEmptyArray<NBTMap>,
): boolean {
  const A_ = A.slice(0)
  const B_ = B.slice(0)
  do {
    const a = A_.pop()
    const i = B_.findIndex(b => nbtMatch(a, b))
    if (i === -1)
      return false
    delete B_[i]
  } while (A_.length)
  return true
}

/*
// Tests
const test = (s: string) => {
  // eslint-disable-next-line no-eval
  const [a, b] = eval(`([${s}])`)
  return console.log(nbtMatch(a, b) ? '✔️ ' : '❌', s)
}

test('{A:1}, {A:1}')
test('{A:1}, {A:2}')
test('{A:1}, {A:"1"}')

test('{A:1,B:2}, {B:2,A:1,C:3}')
test('{A:1,B:2}, {B:2,A:2,C:3}')

test('{A:{B:"str"}}, {B:0,A:{C:3,B:"str"}}')
test('{A:[1,2,3]}, {A:[1,2]}')
test('{A:[1,2,3]}, {A:[1,2,4]}')
test('{A:[1,2,3]}, {A:[1,2,3,4,5]}')
test('{A:[]}, {A:[{B:1,C:2}, {D:3,E:4}, {F:5}]}')
test('{A:[{C:2},{B:1}]}, {A:[{B:1,C:2}, {D:3,E:4}, {F:5}]}')
test('{A:[{C:2},{E:4}]}, {A:[{B:1,C:2}, {D:3,E:4}, {F:5}]}')
 */

/* function testParse(s: string) {
  console.log(s)
  console.log(parseSNbt(s))
}

testParse('{Fluid:{FluidName:"uranium_238",Amount:16000}}')
testParse(
  '{enderio.darksteel.upgrade.energyUpgrade:{level:3,energy:1000000},enderio.darksteel.upgrade.travel:{level:0},enderio.darksteel.upgrade.spoon:{level:0},enderio.darksteel.upgrade.tnt:{level:0},enderio.darksteel.upgrade.direct:{level:0},ench:[{id:63,lvl:2s}]}'
)
testParse(
  '{tier:3,mekData:{fluidTank:{FluidName:"ec.internal.chlorine",Amount:1000}}}'
)
testParse('{Material:"endorium"}')
testParse('{ench:[{id:4,lvl:4s}]}')
testParse(
  '{"enderio:filter":{"enderio:class":"crazypants.enderio.base.filter.item.SoulFilter",souls:{size:1,0:{entityId:"twilightforest:armored_giant"}},blacklist:0b,sticky:0b,slotCount:10}}'
)
testParse('{mana:99999999,ench:[{id:59,lvl:4s}]}')
testParse(
  '{TinkerData:{Materials:["iridium","iridium","prismarine","manyullyn"],Modifiers:["toolleveling"]},Stats:{Durability:1260,HarvestLevel:10,Attack:9.0f,MiningSpeed:6.75f,AttackSpeedMultiplier:1.0f,FreeModifiers:2,LaserGunEnergy:80000000,LaserGunPower:9.0f,LaserGunRange:15.0f},StatsOriginal:{Durability:1260,HarvestLevel:10,Attack:9.0f,MiningSpeed:6.75f,AttackSpeedMultiplier:1.0f,FreeModifiers:3,LaserGunEnergy:80000000,LaserGunPower:9.0f,LaserGunRange:15.0f},Special:{Categories:["weapon","tool"]},Modifiers:[{identifier:"momentum",color:-4013601,level:1},{identifier:"tconevo.overwhelm",color:-4013601,level:1},{identifier:"aquadynamic",color:-8462660,level:1},{identifier:"coldblooded",color:-6202120,level:1},{identifier:"toolleveling",color:16777215,level:1}],Traits:["momentum","tconevo.overwhelm","aquadynamic","coldblooded","toolleveling"]}'
)
testParse('{Facing:3b,SideCache:[B;1B,1B,2B,2B,2B,2B],RSControl:0b,Energy:0}')
testParse(
  '{preview:{bBox:[I;0,0,0,1,1,1],tile:{block:"minecraft:stone"}},display:{Name:"Little Chisel"}}'
) */
