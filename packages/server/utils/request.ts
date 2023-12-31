import { type RequestFunction, createRequest } from '@valorant-bot/shared'

export const requestMap: Map<string, RequestFunction> = new Map()

function $createRequest(qq: string) {
  return createRequest(
    (res, cookieJar) => {
      const cookie = res.headers.getSetCookie()
      cookie && (cookieJar[qq] = cookie)
    },
    (cookieJar) => {
      return cookieJar[qq] || []
    },
  )
}

export function useRequest(qq?: string) {
  if (!qq) {
    return createRequest()
  }

  if (!requestMap.has(qq)) {
    requestMap.set(qq, $createRequest(qq))
  }

  return requestMap.get(qq)!
}

export function useCleanRequest(qq: string) {
  if (requestMap.get(qq)) {
    requestMap.delete(qq)
  }
  return useRequest(qq)
}
