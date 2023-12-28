import type { NotNull } from '@valorant-bot/shared'
import type { createInGameApi } from '../api/in-game'
import type { parseRSOAuthResultUri } from '../utils/rso'

export type InGameApiInstance = ReturnType<typeof createInGameApi>

export type ParsedRSOAuthResult = NotNull<
  ReturnType<typeof parseRSOAuthResultUri>
>
