import { AddRecipeFn } from '../../customs'

export default function addRecipes(addRecipe: AddRecipeFn) {
  addRecipe(
    'dimension:-343800852',
    '10x placeholder:exploration',
    'randomthings:spectrekey'
  )

  addRecipe('randomthings:ingredient:2', '400x placeholder:ticks')

  addRecipe('randomthings:beanpod:0', 'randomthings:beans:2')
  addRecipe(
    'randomthings:spectresapling:0',
    'ore:treeSapling',
    'randomthings:ingredient:2'
  )

  addRecipe(
    [
      '6x randomthings:spectrelog:0',
      'randomthings:spectresapling:0',
      '12x randomthings:spectreleaf:0',
      'randomthings:ingredient:2',
    ],
    '10000x placeholder:ticks',
    'randomthings:spectresapling:0'
  )
}
