import { parse } from 'csv-parse/browser/esm'

import { loadDataCSVEx } from './csv'

export default function loadDataCSV(csvText: string) {
  return loadDataCSVEx(csvText, parse)
}
