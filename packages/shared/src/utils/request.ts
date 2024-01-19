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

export function generateHeaders(otherHeaders: object = {}): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...Object.fromEntries(
      Object.entries(otherHeaders).filter(([, value]) => value),
    ),
  })
  return headers
}

export type RequestFunction = ReturnType<typeof createRequest>
export function createRequest(
  syncSession?: boolean,
  handleCookies?: (
    response: Response,
    cookieJar: Record<string, string[]>,
  ) => void | Promise<void>,
  getCookies?: (
    cookieJar: Record<string, string[]>,
  ) => string[] | Promise<string[]>,
) {
  const cookieJar: Record<string, string[]> = {}

  async function request<T = any>(url: string, options: RequestOptions = {}) {
    const cookies = async () => {
      if (getCookies == null) {
        return cookieJar[url]?.join('; ') || undefined
      } else {
        return (await getCookies(cookieJar))?.join('; ') || undefined
      }
    }

    const headers = generateHeaders({
      ...options.headers,
      cookie: syncSession ? await cookies() : undefined,
    })

    const response = await fetch(url, {
      ...objectOmit(options, ['body', 'headers']),
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const responseJson = await response.json()
      throw new Error(
        `Error, status ${response.status}: ${JSON.stringify(responseJson)}`,
        {
          cause: {
            url,
            method: options.method,
            body: options.body,
            headers: Object.fromEntries(headers.entries()),
            status: response.status,
            statusText: response.statusText,
          },
        },
      )
    }

    if (syncSession) {
      if (handleCookies != null) {
        await handleCookies(response, cookieJar)
      } else {
        const cookie = response.headers.getSetCookie()
        if (cookie) {
          cookieJar[url] = cookie
        }
      }
    }

    return response.json() as Promise<T>
  }

  return {
    request,
    cookieJar,
  }
}
