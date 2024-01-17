import { createRequest } from '@valorant-bot/shared'

export function getLoginRiotRedisKey(qq: string) {
  return `riot:login:${qq}`
}

function $createRequest(qq?: string) {
  const key = getLoginRiotRedisKey(qq ?? 'unknown')

  return createRequest(
    async (res) => {
      if (!qq) return
      const cookie = res.headers.getSetCookie()
      cookie && (await useRedisStorage().setItem(key, cookie))
    },
    async () => {
      if (!qq) return []
      return (await useRedisStorage().getItem<string[]>(key)) ?? []
    },
  )
}

export function useRequest(qq?: string) {
  return $createRequest(qq)
}

export async function useCleanRequest(qq: string) {
  const key = getLoginRiotRedisKey(qq)
  if (await useRedisStorage().getItem(key)) {
    await useRedisStorage().removeItem(key)
  }
  return useRequest(qq)
}
