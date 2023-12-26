/* eslint-disable no-console */
import 'dotenv/config'
import { question } from 'readline-sync'
import { createInGameApi } from './src/api/in-game'
import { parseRSOAuthResUri } from './src/utils/rso'
import {
  fetchAuthLogin,
  fetchGetAuthCookies,
  fetchGetEntitlementToken,
  fetchGetPlayerInfo,
  fetchGetRegion,
  fetchGetStoreFrontInfo,
  fetchMultiFactorAuth,
} from './src'

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
  const result = await fetch(
    `https://valorant-api.com/v1/weapons/skinlevels/${item}?language=zh-TW`,
  )

  resultSkins.push((await result.json()).data.displayName)
}

console.log(
  `${playerInfo.acct.game_name} 今日刷新的皮肤为：${resultSkins.map(
    (item) => `\n${item}`,
  )}`,
)
