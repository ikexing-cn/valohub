import { createRequest } from '@valorant-bot/shared'

export function getLoginRiotRedisKey(qq: string) {
  return `riot:login:${qq}`
}

function $createRequest(qq?: string, syncSession?: boolean) {
  const key = getLoginRiotRedisKey(qq ?? 'unknown')

  return createRequest(
    syncSession,
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

export function useRequest(
  qqOrSyncSession?: string | boolean,
  syncSession?: boolean,
) {
  if (typeof syncSession === 'boolean') {
    return $createRequest(qqOrSyncSession as string, true)
  } else {
    return typeof qqOrSyncSession === 'string'
      ? $createRequest(qqOrSyncSession)
      : $createRequest(undefined, qqOrSyncSession)
  }
}

export async function useCleanRequest(qq: string) {
  const key = getLoginRiotRedisKey(qq)
  if (await useRedisStorage().getItem(key)) {
    await useRedisStorage().removeItem(key)
  }
  return useRequest(qq, true)
}
