import { env } from 'node:process'
import { createHash } from 'node:crypto'

export function calculateMd5(content: string, appendAscillStr: boolean = true) {
  return createHash('md5').update(content).update(appendAscillStr ? env.PASSWORD_ASCILL_STR ?? '' : '').digest('hex')
}
