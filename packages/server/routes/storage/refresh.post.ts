/* eslint-disable no-console */
import { OffiApiClient } from '@tqman/valoffi-api-client'
import type { StorageType } from '@valorant-bot/server-database'

const languages = {
  'en-US': 'en-US',
  'zh-TW': 'zh-TW',
  'zh-CN': 'zh-CN',
  'ja-JP': 'ja-JP',
}

export default defineEventHandler(async () => {
  const prisma = usePrisma()
  const api = new OffiApiClient({ parseResponseData: true })

  const toStorage: {
    weapons: { language: string; type: StorageType; content: object }[]
  } = {
    weapons: [],
  }

  await prisma.$transaction(
    async (client) => {
      await client.storage.deleteMany({})

      for (const language of Object.keys(languages)) {
        const { data: weapon } = await api.fetch('weapons', { language })
        toStorage.weapons.push({ language, type: 'WEAPON', content: weapon })
      }
      await client.storage.createMany({ data: toStorage.weapons })

      const { data: version } = await api.fetch('version')
      await client.storage.create({
        data: {
          type: 'VERSION',
          content: version,
        },
      })
    },
    { timeout: 2 * 60 * 1000 },
  )

  return useResponse()('ok')
})
