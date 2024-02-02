import { createHash } from 'node:crypto'

/**
 * Create a new subset object by omit giving keys
 */
export function objectOmit<O extends object, T extends keyof O>(
  obj: O,
  keys: T[],
  omitUndefined = false,
) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      return (!omitUndefined || value !== undefined) && !keys.includes(key as T)
    }),
  ) as Omit<O, T>
}

export function dMd5(str: string) {
  return md5(md5(str))
}

export function md5(str: string) {
  return createHash('md5').update(str).digest('hex')
}

export function isEmptyArray<T extends any[]>(arr?: T): boolean {
  return arr ? arr.length <= 0 : false
}
