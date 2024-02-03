import {
  type ValorantApiClient,
  createValorantApiClient,
  provideClientVersionViaVAPI,
  useProviders,
} from '@tqman/valorant-api-client'

import {
  authRequestEndpoint,
  cookieReauthEndpoint,
} from '@tqman/valorant-api-types'

import { CookieJar } from 'tough-cookie'

function ensureArray<T>(input: T | T[] | undefined) {
  if (!input)
    return []
  else if (Array.isArray(input))
    return input
  else
    return [input]
}

function parseUrl(_url: string) {
  const url = new URL(_url)
  return `${url.hostname}:${url.pathname.slice(1).replaceAll('/', '-')}`
}

export function getStoreCokiesRedisKey(
  qq: string,
  alias: string,
  url: string = authRequestEndpoint.suffix,
) {
  return `valorant-bot:${qq}:${alias}:${parseUrl(url)}:cookies`
}

let vapic: ValorantApiClient
export async function useVapic(qq: string, alias: string) {
  const event = useEvent()
  const valorantInfo = event.context.valorantInfo

  if (!vapic) {
    vapic = await createValorantApiClient({
      auth: useProviders(provideClientVersionViaVAPI()),
    })

    const redisStorage = useRedisStorage()
    const axiosInstance = vapic.auth.axiosInstance
    axiosInstance.interceptors.request.use(async (config) => {
      if (config.url) {
        const cookies = await redisStorage.getItem<string>(
          getStoreCokiesRedisKey(qq, alias, config.url),
        )

        const cookieWithDatabase = valorantInfo?.cookies

        if (config.url && cookies) {
          const cookieJar = new CookieJar()
          cookieJar.setCookieSync(cookies, config.url)
          const previousCookie = config.headers.Cookie ?? ''

          let Cookie
            = previousCookie + cookieJar.getCookieStringSync(config.url)

          if (config.url === cookieReauthEndpoint.suffix)
            Cookie += cookieWithDatabase ?? ''

          config.headers = Object.assign(config.headers, { Cookie })
        }
      }

      return config
    })
    axiosInstance.interceptors.response.use(async (response) => {
      if (response.headers['set-cookie']) {
        const url = response.config.url
        const cookieJar = new CookieJar()
        if (url) {
          const redisKey = getStoreCokiesRedisKey(qq, alias, url)
          const cookies = ensureArray(response.headers['set-cookie'])
          cookies.forEach(cookie => cookieJar.setCookieSync(cookie, url))
          await redisStorage.setItem(
            redisKey,
            cookieJar.getCookieStringSync(url),
          )
        }
      }
      return response
    })
  }
  return vapic
}
