import { fetch as fetchWithProrxy } from 'node-fetch-native/proxy'
import { objectOmit } from './utils/internal'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: object
}

export type TRequest = typeof createRequest
export function createRequest() {
  const sessionCookieJar: { [key: string]: string[] } = {}

  function generateHeaders(otherHeaders: object = {}) {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    for (const [key, value] of Object.entries(otherHeaders)) {
      if (value == null) continue
      headers.append(key, value)
    }
    return headers
  }

  async function request(
    url: string,
    options: RequestOptions = {},
  ): Promise<Response> {
    const headers = generateHeaders({
      ...options.headers,
      cookie: sessionCookieJar[url]
        ? sessionCookieJar[url].join('; ')
        : undefined,
    })

    const response = await fetchWithProrxy(url, {
      ...objectOmit(options, ['body', 'headers']),
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
      credentials: 'include',
    })

    const cookie = response.headers.getSetCookie()
    if (cookie) {
      sessionCookieJar[url] = cookie
    }
    return response
  }

  return request
}
