import { createValorantApi } from '@valorant-bot/core'
import { createRequest } from '../utils/request'
import type {
  AliasOnlyRequest,
  InGameStoreFrontResponse,
} from '@valorant-bot/shared'

export function dailyStore(sender: number) {
  return sendFetch([sender])
}

async function sendFetch(
  config: Parameters<typeof createRequest>,
): Promise<string> {
  const request = createRequest(...config)
  const response = await request<AliasOnlyRequest, InGameStoreFrontResponse>(
    '/in-game/store-front',
  )

  if (!response.success) {
    return `${response.message}`
  }

  const result = response.data.items

  const res = await Promise.all(
    result!.map(async (item) => {
      const res = await fetch(
        createValorantApi('zh-TW').getWeaponLevelFromUUID(item.uuid),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      return `${item.costType}: ${item.cost} ${
        ((await res.json()) as any).data.displayName
      }`
    }),
  )

  return res.join('\n')
}
