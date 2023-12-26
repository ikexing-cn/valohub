import type { createInGameApi } from '../api/in-game'
import type { parseRSOAuthResultUri } from '../utils/rso'

export type NotNull<T extends unknown | null | undefined> = T extends
  | null
  | undefined
  ? never
  : T

export type InGameApiInstance = ReturnType<typeof createInGameApi>

export type ParsedRSOAuthResult = NotNull<
  ReturnType<typeof parseRSOAuthResultUri>
>
