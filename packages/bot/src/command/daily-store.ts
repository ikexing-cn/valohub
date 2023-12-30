import { createValorantApi } from '@valorant-bot/core'
import { createRequest } from '../utils/request'
import type {
  InGameStoreFrontResponse,
  InGameStoreFrontSchema,
} from '@valorant-bot/shared'

export function dailyStore(sender: number) {
  return sendFetch([sender])
}

async function sendFetch(
  config: Parameters<typeof createRequest>,
): Promise<string> {
  const request = createRequest(...config)
  const response = await request<
    InGameStoreFrontSchema,
    InGameStoreFrontResponse
  >('/in-game/store-front')

  if (!response.success) {
    return response.message
  }

  const result = response.data.skinItems!

  const res = await Promise.all(
    result.map(async (uuid) => {
      const res = await fetch(
        createValorantApi('zh-TW').getWeaponLevelFromUUID(uuid),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      return ((await res.json()) as any).data.displayName
    }),
  )

  return res.join('\n')
}
