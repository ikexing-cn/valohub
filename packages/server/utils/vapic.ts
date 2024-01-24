import {
  type ValorantApiClient,
  createValorantApiClient,
  provideAuthViaTokens,
  provideClientVersionViaAuthApi,
  provideClientVersionViaVAPI,
  provideRegion,
  useProviders,
} from '@tqman/valorant-api-client'

import { CookieJar } from 'tough-cookie'

function ensureArray<T>(input: T | T[] | undefined) {
  if (!input) {
    return []
  } else if (Array.isArray(input)) {
    return input
  } else {
    return [input]
  }
}

function parseUrl(_url: string) {
  const url = new URL(_url)
  return `${url.hostname}:${url.pathname.replaceAll('/', '-')}`
}

let vapic: ValorantApiClient

export async function useVapic(qqWithAlias: string) {
  if (!vapic) {
    vapic = await createValorantApiClient({
      auth: useProviders(provideClientVersionViaVAPI()),
    })

    const redisStorage = useRedisStorage()
    // eslint-disable-next-line unused-imports/no-unused-vars
    const axiosInstance = vapic.auth.axiosInstance
    axiosInstance.interceptors.request.use(async (config) => {
      if (config.url) {
        const cookies = await redisStorage.getItem<string>(
          `valorant-bot:${qqWithAlias}:${parseUrl(config.url)}:cookies`,
        )

        if (config.url && cookies) {
          const cookieJar = new CookieJar()
          cookieJar.setCookieSync(cookies, config.url)
          const previousCookie = config.headers.Cookie ?? ''
          config.headers = Object.assign(config.headers, {
            Cookie: previousCookie + cookieJar.getCookieStringSync(config.url),
          })
        }

        return config
      }

      return config
    })
    axiosInstance.interceptors.response.use(async (response) => {
      if (response.headers['set-cookie']) {
        const url = response.config.url
        const cookieJar = new CookieJar()
        if (url) {
          const cookies = ensureArray(response.headers['set-cookie'])
          const redisKey = `valorant-bot:${qqWithAlias}:${parseUrl(url)}:cookies`
          cookies.forEach((cookie) => cookieJar.setCookieSync(cookie, url))
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

export interface Tokens {
  idToken: string
  accessToken: string
  entitlementsToken: string
}
export async function updateVapic({
  tokens,
  region,
  shard,
  qqWithAlias,
}: {
  tokens: Tokens
  region: string
  shard: string
  qqWithAlias: string
}) {
  const vapic = await useVapic(qqWithAlias)
  await vapic.reinitializeWithProviders({
    remote: useProviders([
      provideClientVersionViaAuthApi(),
      provideRegion(region.toLowerCase(), shard.toLowerCase()),
      provideAuthViaTokens(tokens.accessToken, tokens.entitlementsToken),
    ]),
  })
}
