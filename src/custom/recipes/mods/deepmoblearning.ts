export default function addRecipes(
  addRecipe: (
    recipe_source: string,
    outputs: string | string[],
    inputs?: string | string[],
    catalysts?: string | string[]
  ) => void
) {
  ;(
    [
      ['zombie', 200],
      ['skeleton', 200],
      ['spider', 500],
      ['slime', 700],
      ['enderman', 2000],
      ['witch', 600],
      ['witherskeleton', 1000],
    ] as const
  ).forEach(([entity, cost]) => {
    ;[0, 1, 2, 3, 4].forEach((tier) => {
      addRecipe(
        'custom_dml',
        `deepmoblearning:trial_key:0:{attuned:1b,mobKey:"${entity}",tier:${tier}}`,
        [
          'deepmoblearning:trial_key:0',
          `${cost * (tier + 1)}x placeholder:fight`,
        ],
        'deepmoblearning:data_model_blank:0'
      )
    })
  })
}
