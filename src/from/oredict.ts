export interface OredictMap {
  [oreName: string]: string
}

export default function genOreDictionary(crafttweakerLogTxt: string) {
  const dict: OredictMap = {}

  const oreEntriesRgx =
    /^Ore entries for <ore:([^>]+)> :[\n\r]+-<([^:>]+:[^:>]+):?([^:>]+)?/gm
  for (const [, oreDictName, definition, meta] of crafttweakerLogTxt.matchAll(
    oreEntriesRgx
  )) {
    dict[oreDictName] = `${definition}:${meta && meta !== '*' ? meta : 0}`
  }
  return dict
}
