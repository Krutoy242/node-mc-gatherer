export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('animania:wool:*', '9000x placeholder:ticks')

  Object.entries({
    sheep_cheese_wheel   : 'milk_sheep',
    goat_cheese_wheel    : 'milk_goat',
    jersey_cheese_wheel  : 'milk_jersey',
    holstein_cheese_wheel: 'milk_holstein',
    friesian_cheese_wheel: 'milk_friesian',
  }).forEach(([wheel, milk]) => {
    addRecipe(
      `animania:${wheel}:0`,
      `1000x fluid:${milk}`,
      'animania:cheese_mold:0'
    )
    addRecipe(
      `1000x fluid:${milk}`,
      '300x placeholder:ticks',
      '30000x placeholder:exploration'
    )
  })
  ;[
    'animania:blue_peacock_feather:0',
    'animania:white_peacock_feather:0',
    'animania:charcoal_peacock_feather:0',
    'animania:opal_peacock_feather:0',
    'animania:peach_peacock_feather:0',
    'animania:purple_peacock_feather:0',
    'animania:taupe_peacock_feather:0',
  ].forEach(s => addRecipe(s, '300x placeholder:ticks'))
  ;[
    'animania:peacock_egg_blue:0',
    'animania:peacock_egg_white:0',
    'animania:brown_egg:0',
  ].forEach(s => addRecipe(s, '250x placeholder:ticks'))
  ;[
    'animania:raw_chevon:0',
    'animania:raw_frog_legs:0',
    'animania:raw_horse:0',
    'animania:raw_peacock:0',
    'animania:raw_prime_beef:0',
    'animania:raw_prime_chevon:0',
    'animania:raw_prime_chicken:0',
    'animania:raw_prime_mutton:0',
    'animania:raw_prime_peacock:0',
    'animania:raw_prime_pork:0',
    'animania:raw_prime_rabbit:0',
  ].forEach(s => addRecipe(s, '550x placeholder:ticks'))
}
