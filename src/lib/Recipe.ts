import Stack from './Stack'

export default class Recipe {
  constructor(
    private outputs: Stack[],
    private inputs?: Stack[],
    private catalysts?: Stack[]
  ) {}

  export() {
    return {
      outputs: this.outputs.map((o) => o.export()),
      inputs: this.inputs?.map((o) => o.export()),
      catalysts: this.catalysts?.map((o) => o.export()),
    }
  }
}
