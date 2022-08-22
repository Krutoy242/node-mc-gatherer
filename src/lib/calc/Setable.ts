import type { Calculable } from '../../api'
import { Pos } from '../../tools/CsvDecorators'

export default abstract class Setable implements Calculable {
  private _cost = 0.0

  @Pos(12)
  public get cost() {
    return this._cost
  }

  private _processing = 0.0

  @Pos(13)
  public get processing() {
    return this._processing
  }

  private _purity = 0.0

  @Pos(10)
  public get purity() {
    return this._purity
  }

  public set(cal: { purity: number; cost: number; processing: number }) {
    this._purity = cal.purity
    this._cost = cal.cost
    this._processing = cal.processing
  }

  /**
   * @returns `true` if recipe was calculated for the first time
   */
  abstract calculate(): true | undefined

  @Pos(11)
  public get complexity(): number {
    return this.cost + this.processing
  }
}
