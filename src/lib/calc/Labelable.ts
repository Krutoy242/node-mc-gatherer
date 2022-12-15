import { LabelSetup } from '../../api'
import type { Labeled } from '../../api'
import Setable from './Setable'

export default abstract class Labelable extends Setable implements Labeled {
  labels = ''

  protected abstract isLabeled(label: keyof typeof LabelSetup): boolean

  finalize() {
    // Compute and apply all labels
    type LabKey = keyof typeof LabelSetup
    const entries = Object.entries(LabelSetup) as [LabKey, typeof LabelSetup[LabKey]][]
    this.labels = entries
      .map(([label, { char }]) => this.isLabeled(label) ? char : '')
      .join('')
  }
}
