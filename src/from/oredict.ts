export type OredictMap = { [oreName: string]: string }

export default function genOreDictionary(crafttweakerLogTxt: string) {
  const dict: OredictMap = {}

  const oreEntriesRgx =
    /^Ore entries for <ore:([\w]+)> :[\n\r]+-<([^:>]+:[^:>]+):?([^:>]+)?/gm
  for (const [, oreDictName, definition, meta] of crafttweakerLogTxt.matchAll(
    oreEntriesRgx
  )) {
    dict[oreDictName] = `${definition}:${meta && meta !== '*' ? meta : 0}`
  }
  return dict
}
