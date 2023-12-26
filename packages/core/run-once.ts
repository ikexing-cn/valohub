/* eslint-disable no-console */
import 'dotenv/config'

import { question } from 'readline-sync'
import { createInGameApi } from './src/api/in-game'
import { parseRSOAuthResultUri } from './src/utils/rso'
import {
  fetchAuthLogin,
  fetchGetAuthCookies,
  fetchGetEntitlementToken,
  fetchGetPlayerInfo,
  fetchGetRegion,
  fetchGetStoreFrontInfo,
  fetchMultiFactorAuth,
} from './src'
import type { AuthResponse } from './src/types/request'

async function tryMFA() {
  const code = question('请输入二步验证的code:')
  const resultMFA = await fetchMultiFactorAuth({
    code,
    rememberDevice: true,
  })
  if (resultMFA.type !== 'response') {
    console.log('二步验证码错误，请重试！\n')
    return tryMFA()
  }
  return resultMFA
}

async function getResultUri() {
  let resultUri: AuthResponse
  if (process.env.RSO_URI) {
    resultUri = {
      type: 'response',
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

    if (authLoginResult.type === 'multifactor') {
      console.log('需要二步验证', authLoginResult)
      resultUri = await tryMFA()
    } else if (authLoginResult.type === 'response') {
      resultUri = authLoginResult
    } else {
      throw new Error('获取登录结果失败')
    }
  }
  return resultUri
}

const resultUri = await getResultUri()
console.log(resultUri)

const rsoAuthResUri = parseRSOAuthResultUri(resultUri)
if (rsoAuthResUri == null) {
  console.log('parse 失败')
  process.exit(1)
}

// 获取地域
const resultRegion = await fetchGetRegion(rsoAuthResUri)

// 获取 entitlementsToken
const { entitlements_token } = await fetchGetEntitlementToken(rsoAuthResUri)

// 获取 playerInfo
const playerInfo = await fetchGetPlayerInfo(rsoAuthResUri)
console.log(playerInfo)

const {
  SkinsPanelLayout: { SingleItemOffers },
} = await fetchGetStoreFrontInfo({
  userId: playerInfo.sub,
  parsedRSOAuthResult: rsoAuthResUri,
  entitlementsToken: entitlements_token,
  inGame: createInGameApi(resultRegion.affinities.live),
})

// 根据皮肤 id 查询出皮肤名称（valorant-api -> 繁体）
const resultSkins = []
for (const item of SingleItemOffers) {
  const result = await fetch(
    `https://valorant-api.com/v1/weapons/skinlevels/${item}?language=zh-TW`,
  )

  resultSkins.push(((await result.json()) as any).data.displayName)
}

console.log(
  `${playerInfo.acct.game_name} 今日刷新的皮肤为：${resultSkins.map(
    (item) => `\n${item}`,
  )}`,
)
