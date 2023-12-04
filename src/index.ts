/* eslint-disable no-console */
import { parse } from 'node:url'
import { cFetch } from './utils'
import type { PutAuthRequestResponse } from './types'

enum API {
  AUTH_COOKIES = 'https://auth.riotgames.com/api/v1/authorization',
  REGION_URL = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant',
  ENTITLEMENT_URL = 'https://entitlements.auth.riotgames.com/api/token/v1/',
  PLAYER_INFO = 'https://auth.riotgames.com/userinfo',
}

const genEndpointServerBaseAPI = (server: string, url: string) =>
  `https://pd.${server}.a.pvp.net${url}`

async function fetchGetAuthCookies(cookies: string[]) {
  const result = await cFetch(API.AUTH_COOKIES, {
    method: 'POST',
    body: {
      client_id: 'play-valorant-web-prod',
      nonce: '1',
      redirect_uri: 'https://playvalorant.com/opt_in',
      response_type: 'token id_token',
      scope: 'account openid',
    },
  })

  cookies.push(...result.headers.getSetCookie())
}

async function fetchAuthLogin(
  cookies: string[],
  accountInfo: {
    remember?: boolean
    username: string
    password: string
  },
) {
  const { username, password, remember = true } = accountInfo
  const result = await cFetch(API.AUTH_COOKIES, {
    headers: {
      Cookie: cookies.join('; '),
    },
    method: 'PUT',
    body: {
      type: 'auth',
      language: 'en_US',
      username,
      password,
      remember,
    },
  })

  return result.json() as Promise<PutAuthRequestResponse>
}

async function fetchGetRegion(accessToken: string, idToken: string) {
  const result = await cFetch(API.REGION_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      id_token: idToken,
    },
  })
  return result.json() as Promise<{
    token: string
    affinities: {
      pbe: string
      live: string
    }
  }>
}

async function fetchGetEntitlementToken(accessToken: string) {
  const result = await cFetch(API.ENTITLEMENT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return result.json() as Promise<{
    entitlements_token: string
  }>
}

async function fetchGetPlayerInfo(entitlementsToken: string) {
  const result = await cFetch(API.PLAYER_INFO, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${entitlementsToken}`,
    },
  })
  return result.json()
}

async function fetchGetStoreFrontInfo({
  server,
  userId,
  accessToken,
  entitlementsToken,
}: {
  server: string
  userId: string
  accessToken: string
  entitlementsToken: string
}) {
  const baseUrl = `/store/v2/storefront/${userId}`
  const fullUrl = genEndpointServerBaseAPI(server, baseUrl)
  console.log({ fullUrl })
  const result = await cFetch(fullUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlementsToken,
    },
  })

  return result.json()
}

// =================

const cookies = [] as string[]
await fetchGetAuthCookies(cookies)
const result = await fetchAuthLogin(cookies, {
  username: 'kqrTist',
  password: 'QE1c]WU123',
})

if (result.type !== 'response') {
  // TODO
  console.log('需要二步验证')
  process.exit(1)
}

const uri = result.response.parameters.uri

function parseUri(uri: string) {
  const tokens =
    /access_token=((?:[A-Za-z]|\d|\.|-|_)*).*id_token=((?:[A-Za-z]|\d|\.|-|_)*).*expires_in=(\d*)/.exec(
      uri,
    )

  return {
    accessToken: tokens![1],
    idToken: tokens![2],
    expiresIn: tokens![3],
  }
}

const { accessToken, idToken } = parseUri(uri)

const {
  affinities: { live },
} = await fetchGetRegion(accessToken, idToken)

console.log({ live })

const { entitlements_token } = await fetchGetEntitlementToken(accessToken)
console.log({ entitlements_token })

const playerInfo = await fetchGetPlayerInfo(accessToken)
console.log(playerInfo)
// sub -> user id

const {
  SkinsPanelLayout: { SingleItemOffers },
} = await fetchGetStoreFrontInfo({
  accessToken,
  server: live,
  userId: playerInfo.sub,
  entitlementsToken: entitlements_token,
})

// console.log(SingleItemOffers)

const resultSkins = []
for (const item of SingleItemOffers) {
  // https://valorant-api.com/v1/weapons/skinlevels/0767c288-4ac6-4a8c-6f76-be8ca91e2991?language=zh-CN
  const result = await cFetch(
    `https://valorant-api.com/v1/weapons/skinlevels/${item}?language=zh-CN`,
  )

  resultSkins.push((await result.json()).data.displayName)
}

console.log(
  `${playerInfo.acct.game_name} 今日刷新的皮肤为：${resultSkins.map(
    (item) => `\n${item}`,
  )}`,
)
