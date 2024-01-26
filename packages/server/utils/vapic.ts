import {
  MFAError,
  type ValorantApiClient,
  type VapicProvider,
  createValorantApiClient,
  getEntitlementsToken,
  getTokensUsingCredentials,
  getTokensUsingReauthCookies,
  provideAuthViaTokens,
  provideClientVersionViaAuthApi,
  provideClientVersionViaVAPI,
  provideRegion,
  useProviders,
} from '@tqman/valorant-api-client'

import {
  authRequestEndpoint,
  cookieReauthEndpoint,
} from '@tqman/valorant-api-types'

import { defer, firstValueFrom, retry } from 'rxjs'

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

          let Cookie =
            previousCookie + cookieJar.getCookieStringSync(config.url)

          if (config.url === cookieReauthEndpoint.suffix) {
            Cookie += cookieWithDatabase ?? ''
          }

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

export function provideReauth(config: {
  username: string
  password: string
  remember: boolean
}) {
  return (async ({ auth }) => {
    const { username, password, remember } = config
    const valorantInfo = useEvent().context.valorantInfo

    let tokenResult: { accessToken: string; idToken: string }

    try {
      if (valorantInfo.cookies?.includes('ssid=')) {
        const retryGetTokens = defer(() =>
          getTokensUsingReauthCookies(auth),
        ).pipe(
          retry({
            count: 1,
            delay: 500,
          }),
        )
        const result = await firstValueFrom(retryGetTokens)
        return result
      }
    } catch {
      if (remember) {
        tokenResult = await getTokensUsingCredentials(
          auth,
          username,
          password,
        ).catch((error) => {
          if (error instanceof MFAError) {
            throw new DataWithError(
              'Riot 登录已过期, 但检测到您的账户已开启二步验证所以仍需进行手动验证!',
              {
                needMFA: true,
                riotUsername: username,
              },
            )
          }
          throw new DataWithError(
            'Riot 登录已过期, 自动验证失败，请手动验证账户!',
            {
              needReauth: true,
              riotUsername: username,
            },
          )
        })
      }
    }

    const { idToken, accessToken } = tokenResult!
    const entitlementsToken = await getEntitlementsToken(auth, accessToken)

    return {
      idToken,
      accessToken,
      entitlementsToken,
    } as const
  }) satisfies VapicProvider
}

export interface Tokens {
  idToken: string
  accessToken: string
  entitlementsToken: string
}
export async function updateVapic({
  shard,
  region,
  tokens,
  qq,
  alias,
}: {
  shard: string
  tokens: Tokens
  region: string
  qq: string
  alias: string
}) {
  const vapic = await useVapic(qq, alias)
  await vapic.reinitializeWithProviders({
    remote: useProviders([
      provideClientVersionViaAuthApi(),
      provideRegion(region.toLowerCase(), shard.toLowerCase()),
      provideAuthViaTokens(tokens.accessToken, tokens.entitlementsToken),
    ]),
  })
}
