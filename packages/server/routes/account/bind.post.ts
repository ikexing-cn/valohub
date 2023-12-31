import {
  type AccountBindResponse,
  type AccountBindSchema,
  bindSchema,
} from '@valorant-bot/shared'
import { createRSOApi, parseRSOAuthResultUri } from '@valorant-bot/core'
import type { $Enums } from '@prisma/client'

async function loginRiot(
  qq: number,
  parsedBody: AccountBindSchema,
  response: ReturnType<typeof useResponse<AccountBindResponse['data']>>,
) {
  const { username, password, mfaCode, remember = true } = parsedBody

  const request = mfaCode != null ? useRequest(qq) : useCleanRequest(qq)
  const rsoApis = createRSOApi(request)

  let authLoginResult

  if (mfaCode != null) {
    authLoginResult = await rsoApis.fetchAuthMultiFactor({
      rememberDevice: remember,
      code: mfaCode,
    })
    if (authLoginResult.type === 'auth') {
      return [false, response(false, '邮箱验证码错误，请重试！')] as const
    } else if (authLoginResult.type === 'multifactor') {
      return [false, response(false, '邮箱验证码错误，请重试！')] as const
    }
  } else {
    // 重复请求时，需要清空之前的 session
    await rsoApis.fetchAuthPing()
    authLoginResult = await rsoApis.fetchAuthLogin({
      username,
      password,
      remember,
    })
    if (authLoginResult.type === 'auth') {
      return [
        false,
        response(false, '此 Valorant 账号或密码错误，请重试！'),
      ] as const
    } else if (authLoginResult.type === 'multifactor') {
      return [
        false,
        response(
          false,
          '检测到此 Valorant 账号已启用二步验证，请输入邮箱验证码',
          { needMFA: true },
        ),
      ] as const
    }
  }

  if (authLoginResult.type !== 'response') {
    return [false, response(false, '未知错误！')] as const
  }

  return [true, authLoginResult] as const
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = zodParse<AccountBindSchema>(bindSchema, body)

  const account = event.context.account

  const prisma = usePrisma()
  const response = useResponse<AccountBindResponse['data']>()

  const valorantAccountExists = await prisma.valorantInfo.findFirst({
    where: { riotUsername: parsedBody.username },
  })
  if (valorantAccountExists) {
    return response(false, '此 Valorant 账号已被其他 qq 绑定！', {
      isBinded: true,
    })
  }

  const valorantInfoExists = await prisma.valorantInfo.findFirst({
    where: { accountQQ: account.qq, alias: parsedBody.alias },
  })
  if (valorantInfoExists) {
    return response(false, '默认别名已绑定其他 Valorant 账号，请更换别名！', {
      isBinded: true,
    })
  }

  const [isSuccess, authResult] = await loginRiot(
    account.qq,
    parsedBody,
    response,
  )
  if (!isSuccess) return authResult

  const rsoApis = createRSOApi(useRequest())
  const parsedAuthResult = parseRSOAuthResultUri(authResult)
  const [region, playerInfo, entitlementToken] = await Promise.all([
    rsoApis.fetchGetRegion(parsedAuthResult),
    rsoApis.fetchGetPlayerInfo(parsedAuthResult),
    rsoApis.fetchGetEntitlementToken(parsedAuthResult),
  ])

  const [gameName, tagLine] = [
    playerInfo.acct.game_name,
    playerInfo.acct.tag_line,
  ]
  await prisma.valorantInfo.create({
    include: { account: true },
    data: {
      accountQQ: account.qq,

      alias: parsedBody.alias,
      parsedAuthResult: JSON.stringify(parsedAuthResult),
      entitlementsToken: entitlementToken.entitlements_token,
      riotUsername: parsedBody.username,
      riotPassword: parsedBody.password,

      uuid: playerInfo.sub,
      country: playerInfo.country,
      tagLine: playerInfo.acct.tag_line,
      gameName: playerInfo.acct.game_name,

      region: region.affinities.live.toUpperCase() as $Enums.Region,
    },
  })

  return response(`已成功绑定 ${gameName}#${tagLine}, 欢迎使用!`)
})
