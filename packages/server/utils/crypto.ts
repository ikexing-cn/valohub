import { createHash } from 'node:crypto'

export function dMd5(str: string) {
  return md5(md5(str))
}

export function md5(str: string) {
  return createHash('md5').update(str).digest('hex')
}
