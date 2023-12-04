import type { Agent } from 'node:http'

function generateHeaders(otherHeaders: object = {}) {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')
  for (const [key, value] of Object.entries(otherHeaders)) {
    headers.append(key, value)
  }
  return headers
}

export function objectOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = {} as any satisfies Omit<T, K>
  Object.entries(obj).forEach(([key, value]) => {
    if (!keys.includes(key as unknown as K)) result[key] = value
  })
  return result
}

interface CustomFetchRequestInit extends Omit<RequestInit, 'body'> {
  body?: object
  agent?: Agent
}

export async function cFetch(
  url: string,
  options: CustomFetchRequestInit = {},
) {
  if (!options.agent) {
    const proxyEnv =
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy

    if (proxyEnv) {
      const HttpsProxyAgent = await import('https-proxy-agent').then(
        (r) => r.HttpsProxyAgent || r.default,
      )
      options.agent = new HttpsProxyAgent(proxyEnv)
    }
  }

  return fetch(url, {
    ...objectOmit(options, ['body', 'headers']),
    body: JSON.stringify(options.body),
    headers: generateHeaders(options.headers),
  })
    .then((res) => res)
    .catch((error) => {
      throw error
    })
}
