import Calculable from './Calculable'
import Stack from './Stack'

export default class Recipe implements Calculable {
  complexity = 0.0
  cost = 0.0
  processing = 0.0
  purity = 0.0

  constructor(
    public outputs: Stack[],
    public inputs?: Stack[],
    public catalysts?: Stack[]
  ) {}

  export() {
    return {
      outputs: this.outputs.map((o) => o.export()),
      inputs: this.inputs?.map((o) => o.export()),
      catalysts: this.catalysts?.map((o) => o.export()),
    }
  }
}
