import fs from 'fs'
import { join } from 'path'

import { createCanvas, loadImage } from 'canvas'
import iconIterator from 'mc-iexporter-iterator'

/**
 * Create sprite and append view boxes on this sprite in data
 */
export default async function make_sprite(
  iconsDirPath: string,
  spriteOutputPath: string
) {
  const RES = 2 ** 13
  const canvas = createCanvas(RES, RES)
  const ctx = canvas.getContext('2d')

  let x = 0
  let y = 0
  function moveCursor() {
    x += 32
    if (x > RES - 32) {
      process.stdout.write('.')
      x = 0
      y += 32
      if (y > RES - 32) {
        throw new Error('Out of Sprite space')
      }
    }
  }

  const sheet: { [itemID: string]: string[][] } = {}

  for (const icon of iconIterator(iconsDirPath)) {
    ctx.drawImage(await loadImage(icon.filePath), x, y)

    const entry = [`${x} ${y}`]
    if (icon.sNbt) entry.push(icon.sNbt)
    const stackDef = `${icon.namespace}:${icon.name}:${icon.meta}`
    ;(sheet[stackDef] ??= []).push(entry)

    moveCursor()
  }
  process.stdout.write('\n')

  // Write the image to file
  fs.writeFileSync(
    join(spriteOutputPath, 'spritesheet.png'),
    canvas.toBuffer('image/png')
  )
  fs.writeFileSync(
    join(spriteOutputPath, 'spritesheet.json'),
    '{\n' +
      Object.entries(sheet)
        .map(([id, list]) => `"${id}":${JSON.stringify(list)}`)
        .join(',\n') +
      '\n}'
  )
}
