import type { Calculable } from '../../api'
import { Csv } from '../../tools/CsvDecorators'

export default abstract class Setable implements Calculable {
  protected _cost = 0.0
  @Csv(12) public get cost() { return this._cost }

  protected _processing = 0.0
  @Csv(13) public get processing() { return this._processing }

  protected _purity = 0.0
  @Csv(10) public get purity() { return this._purity }

  protected set(cal: { purity: number, cost: number, processing: number }) {
    this._purity = cal.purity
    this._cost = cal.cost
    this._processing = cal.processing
  }

  @Csv(11)
  public get complexity(): number {
    return this.cost + this.processing
  }
}
