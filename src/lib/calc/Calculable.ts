export default abstract class Calculable {
  private _cost = 0.0

  public get cost() {
    return this._cost
  }

  private _processing = 0.0
  public get processing() {
    return this._processing
  }

  private _purity = 0.0
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
  abstract calculate(): boolean

  public get complexity(): number {
    return this.cost + this.processing
  }
}
