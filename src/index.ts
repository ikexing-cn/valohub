/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
import { question } from 'readline-sync'
import { createRequest } from './fetch'
import {
  type InGameApiInstance,
  createInGameApi,
  replacePlaceholder,
} from './api/in-game'
import {
  APIS,
  getAuthBody,
  getMultiFactorBody,
  getPingBody,
  parseRSOAuthResUri,
} from './utils/rso'
import type { PutAuthRequestResponse } from './types'

import 'dotenv/config'

const request = createRequest()

async function fetchGetAuthCookies() {
  await request(APIS.AUTH_URL, {
    method: 'POST',
    body: getPingBody(),
  })
}

async function fetchAuthLogin(accountInfo: {
  username: string
  password: string
  remember: boolean
}) {
  const result = await request(APIS.AUTH_URL, {
    method: 'PUT',
    body: getAuthBody(accountInfo),
  })

  return result.json() as Promise<PutAuthRequestResponse>
}

function fetchMultiFactorAuth(mfaInfo: {
  code: string
  rememberDevice: boolean
}) {
  return request(APIS.AUTH_URL, {
    method: 'PUT',
    body: getMultiFactorBody(mfaInfo),
  })
}

async function fetchGetRegion(
  rsoAuthResUri: ReturnType<typeof parseRSOAuthResUri>,
) {
  if (!rsoAuthResUri) {
    throw new Error('rsoAuthResUri is undefined')
  }

  const result = await request(APIS.REGION_URL, {
    method: 'PUT',
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
    },
    body: {
      id_token: rsoAuthResUri.idToken,
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

async function fetchGetEntitlementToken(
  rsoAuthResUri: ReturnType<typeof parseRSOAuthResUri>,
) {
  if (!rsoAuthResUri) {
    throw new Error('rsoAuthResUri is undefined')
  }

  const result = await request(APIS.ENTITLEMENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
    },
  })
  return result.json() as Promise<{
    entitlements_token: string
  }>
}

async function fetchGetPlayerInfo(
  rsoAuthResUri: ReturnType<typeof parseRSOAuthResUri>,
) {
  if (!rsoAuthResUri) {
    throw new Error('rsoAuthResUri is undefined')
  }

  const result = await request(APIS.PLAYER_INFO_URL, {
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
    },
  })
  return result.json()
}

async function fetchGetStoreFrontInfo({
  inGame,
  userId,
  rsoAuthResUri,
  entitlementsToken,
}: {
  userId: string
  entitlementsToken: string
  inGame: InGameApiInstance
  rsoAuthResUri: ReturnType<typeof parseRSOAuthResUri>
}) {
  if (!rsoAuthResUri) {
    throw new Error('rsoAuthResUri is undefined')
  }

  const result = await request(replacePlaceholder(inGame.StoreFront, userId), {
    method: 'GET',
    headers: {
      Authorization: `${rsoAuthResUri.tokenType} ${rsoAuthResUri.accessToken}`,
      'X-Riot-Entitlements-JWT': entitlementsToken,
    },
  })

  return result.json()
}

// =================

async function getResultUri() {
  let resultUri
  if (process.env.RSO_URI) {
    resultUri = {
      response: {
        parameters: {
          uri: process.env.RSO_URI,
        },
      },
    }
  } else {
    await fetchGetAuthCookies()
    const authLoginResult = await fetchAuthLogin({
      username: process.env.RSO_USERNAME!,
      password: process.env.RSO_PASSWORD!,
      remember: true,
    })

    if (authLoginResult.type !== 'response') {
      console.log('需要二步验证', authLoginResult)
      const code = question('请输入二步验证的code:')
      const resultMFA = await fetchMultiFactorAuth({
        code,
        rememberDevice: true,
      })
      resultUri = await resultMFA.json()
    } else {
      resultUri = authLoginResult
    }
  }
  return resultUri
}

const resultUri = await getResultUri()
console.log(resultUri)

const rsoAuthResUri = parseRSOAuthResUri(resultUri)
if (rsoAuthResUri == null) {
  console.log('parse 失败')
  process.exit(1)
}

// 获取地域
const resultRegion = await fetchGetRegion(rsoAuthResUri)
console.log(resultRegion)

// 获取 entitlementsToken
const { entitlements_token } = await fetchGetEntitlementToken(rsoAuthResUri)

// 获取 playerInfo
const playerInfo = await fetchGetPlayerInfo(rsoAuthResUri)

const {
  SkinsPanelLayout: { SingleItemOffers },
} = await fetchGetStoreFrontInfo({
  inGame: createInGameApi(resultRegion.affinities.live),
  rsoAuthResUri,
  userId: playerInfo.sub,
  entitlementsToken: entitlements_token,
})

// 根据皮肤 id 查询出皮肤名称（valorant-api -> 繁体）
const resultSkins = []
for (const item of SingleItemOffers) {
  const result = await request(
    `https://valorant-api.com/v1/weapons/skinlevels/${item}?language=zh-TW`,
  )

  resultSkins.push((await result.json()).data.displayName)
}

console.log(
  `${playerInfo.acct.game_name} 今日刷新的皮肤为：${resultSkins.map(
    (item) => `\n${item}`,
  )}`,
)
