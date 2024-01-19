import type { createRSOApi } from '../api/rso'
import type { NotNull } from '@valorant-bot/shared'
import type { createInGameApi } from '../api/in-game'
import type { parseRSOAuthResultUri } from '../utils/rso'

export type RSOApis = ReturnType<typeof createRSOApi>
export type InGameApiInstance = ReturnType<typeof createInGameApi>

export type ParsedRSOAuthResult = NotNull<
  ReturnType<typeof parseRSOAuthResultUri>
>
