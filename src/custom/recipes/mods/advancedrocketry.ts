export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn,
) {
  addRecipe('placeholder:jackhammer:2', 'advancedrocketry:jackhammer:0')

  ;(
    [
      [['advancedrocketry:rocketbuilder:0'], [100]],
      [
        ['advancedrocketry:stationbuilder:0', 'advancedrocketry:warpmonitor:0'],
        [
          106,
          105,
          103,
          101,
          110,
          108,
          109,
          102,
          111,
          112,
          113,
          114,
          115,
          118,
          119,
          120,
          121,
          122,
          123,
          200,
        ],
      ],
    ] as [string[], number[]][]
  ).forEach(([catl, arr]) =>
    arr.forEach(dim =>
      addRecipe(`dimension:${dim}`, '10000x fluid:astralsorcery.liquidstarlight', catl),
    ),
  )
  addRecipe(
    ['361x advancedrocketry:alienwood:0', '3677x advancedrocketry:alienleaves:0'],
    'advancedrocketry:aliensapling:0',
  )
}
