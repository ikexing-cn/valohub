import { fetch as fetchWithProrxy } from 'node-fetch-native/proxy'
import { objectOmit } from './internal'

export interface ApiAuthFailure {
  httpStatus: 401
  errorCode: 'not-authorized'
  message: 'User not authenticated'
  implementationDetails: ''
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: object
}

export type RequestFunction = ReturnType<typeof createRequest>
export function createRequest(
  handleCookies?: (
    response: Response,
    cookieJar: Record<string, string[]>,
  ) => void,
) {
  const cookieJar: Record<string, string[]> = {}

  function generateHeaders(otherHeaders: object = {}) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...Object.fromEntries(
        Object.entries(otherHeaders).filter(([, value]) => value),
      ),
    })
    return headers
  }

  async function request<T = any>(url: string, options: RequestOptions = {}) {
    const headers = generateHeaders({
      ...options.headers,
      cookie: cookieJar[url] ? cookieJar[url].join('; ') : undefined,
    })

    const response = await fetchWithProrxy(url, {
      ...objectOmit(options, ['body', 'headers']),
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
      credentials: 'include',
    })

    if (response.status === 401) {
      const responseJson = (await response.json()) as ApiAuthFailure
      throw new Error(
        `Authentication Failure: ${JSON.stringify(responseJson, null, 2)}`,
      )
    }

    if (!response.ok && response.status !== 401) {
      const responseJson = await response.json()
      throw new Error(
        `Error, status ${response.status}: ${JSON.stringify(
          responseJson,
          null,
          2,
        )}`,
      )
    }

    if (handleCookies != null) {
      handleCookies(response, cookieJar)
    } else {
      const cookie = response.headers.getSetCookie()
      if (cookie) {
        cookieJar[url] = cookie
      }
    }

    return response.json() as Promise<T>
  }

  return request
}
