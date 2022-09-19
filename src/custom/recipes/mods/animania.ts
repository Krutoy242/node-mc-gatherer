export default function addRecipes(
  addRecipe: import('../../customs').AddRecipeFn
) {
  addRecipe('animania:wool:*', '9000x placeholder:ticks')

  Object.entries({
    sheep_cheese_wheel   : 'sheep',
    goat_cheese_wheel    : 'goat',
    jersey_cheese_wheel  : 'jersey',
    holstein_cheese_wheel: 'holstein',
    friesian_cheese_wheel: 'friesian',
  }).forEach(([wheel, name]) => {
    addRecipe(
      `animania:${wheel}:0`,
      `1000x fluid:milk_${name}`,
      'animania:cheese_mold:0'
    )
    const animal = `entity:animania:${(name === 'goat' ? '' : 'cow_') + name}`
    addRecipe(
      `1000x fluid:milk_${name}`,
      '300x placeholder:ticks',
      animal
    )
    addRecipe(animal, '30000x placeholder:exploration')
    addRecipe(animal, 'animania:entity_egg_cow_random:0')
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
