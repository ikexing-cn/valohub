import { type RequestFunction, createRequest } from '@valorant-bot/shared'

const requestMap: Map<string, RequestFunction> = new Map()

export function useRequest(qq?: string) {
  if (!qq) {
    return createRequest()
  }

  if (!requestMap.has(qq)) {
    requestMap.set(
      qq,
      createRequest((res, cookieJar) => {
        const cookie = res.headers.getSetCookie()
        cookie && (cookieJar[qq] = cookie)
      }),
    )
  }

  return requestMap.get(qq)!
}

export function cleanRequest(qq?: string) {
  qq && requestMap.has(qq) && requestMap.delete(qq)
}
