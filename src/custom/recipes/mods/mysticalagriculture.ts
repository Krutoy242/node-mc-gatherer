import type { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe('mysticalagriculture:crafting:0', '1200x placeholder:fight')

  ;[
    [6, 'zombie'],
    [7, 'pig'],
    [9, 'cow'],
    [10, 'sheep'],
    [11, 'slime'],
    [12, 'skeleton'],
    [13, 'creeper'],
    [14, 'spider'],
    [15, 'rabbit'],
    [16, 'guardian'],
    [17, 'blaze'],
    [18, 'ghast'],
    [19, 'enderman'],
  ].forEach(([meta, name]) => addRecipe(
    `mysticalagriculture:chunk:${meta}`,
    `entity:minecraft:${name}`,
    'mysticalagriculture:soulium_dagger:0',
  ))
}
