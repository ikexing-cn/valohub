import { type RequestFunction, createRequest } from '@valorant-bot/shared'

export const requestMap: Map<number, RequestFunction> = new Map()

function $createRequest(qq: number) {
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

export function useRequest(qq?: number) {
  if (!qq) {
    return createRequest()
  }

  if (!requestMap.has(qq)) {
    requestMap.set(qq, $createRequest(qq))
  }

  return requestMap.get(qq)!
}

export function useCleanRequest(qq: number) {
  if (requestMap.get(qq)) {
    requestMap.delete(qq)
  }
  return useRequest(qq)
}
