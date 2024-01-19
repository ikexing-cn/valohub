import {
  type AuthResponse,
  type EntitlementTokenResponse,
  type ParsedRSOAuthResult,
  type RSOApiResponse,
  type RSOApis,
  createRSOApi,
  parseRSOAuthResultUri,
} from '@valorant-bot/core'
import {
  type AccountBindRequest,
  type AccountBindResponse,
  type RequestFunction,
  dMd5,
  objectOmit,
} from '@valorant-bot/shared'
import type { $Enums, Prisma } from '@valorant-bot/server-database'

export function useRSOApi(
  request: RequestFunction['request'],
  initParsedAuthResult?: ParsedRSOAuthResult,
) {
  const event = useEvent()
  const valorantInfo = event.context.valorantInfo

  const rsoApis = createRSOApi(
    initParsedAuthResult ??
      (valorantInfo?.parsedAuthResult as ParsedRSOAuthResult),
  )

  return function <Api extends keyof RSOApis>(
    api: Api,
    ...params: Parameters<RSOApis[Api]> extends unknown[]
      ? Parameters<RSOApis[Api]>
      : never
  ): Promise<RSOApiResponse[Api]> {
    const { url, fetchConfig } = (rsoApis[api] as any)(...params) as {
      url: string
      fetchConfig: Omit<RequestInit, 'body'>
    }
    return request<RSOApiResponse[Api]>(url, fetchConfig)
  }
}

export async function loginRiot(
  qq: string,
  parsedBody: AccountBindRequest,
  response: ReturnType<typeof useResponse<AccountBindResponse['data']>>,
) {
  let authLoginResult
  const { username, password, mfaCode, remember = false } = parsedBody

  const { request } =
    mfaCode != null ? useRequest(qq, true) : await useCleanRequest(qq)
  const rsoApi = useRSOApi(request)

  if (mfaCode != null) {
    authLoginResult = await rsoApi('getAuthMultiFactor', {
      code: mfaCode,
      rememberDevice: remember,
    })

    if (authLoginResult.type === 'auth') {
      return [
        false,
        response(false, '邮箱验证码错误，请重试！', { needRetry: true }),
      ] as const
    } else if (authLoginResult.type === 'multifactor') {
      return [
        false,
        response(false, '邮箱验证码错误，请重试！', { needRetry: true }),
      ] as const
    }
  } else {
    await rsoApi('getAuthPing')
    authLoginResult = await rsoApi('getAuthLogin', {
      remember,
      username,
      password,
    })

    if (authLoginResult.type === 'auth') {
      return [
        false,
        response(false, '此 Valorant 账号或密码错误，请重试！', {
          needRetry: true,
        }),
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

  const key = getLoginRiotRedisKey(qq)
  const cookies = await useRedisStorage().getItem<string[]>(key)
  await useRedisStorage().removeItem(key)

  return [true, authLoginResult, cookies] as const
}

export function getEntitlementToken(rsoApis: ReturnType<typeof useRSOApi>) {
  return rsoApis('getEntitlementToken')
}

export async function getRiotinfo(authResponse: AuthResponse) {
  const { request } = useRequest(false)
  const parsedAuthResult = parseRSOAuthResultUri(authResponse)

  const rsoApis = useRSOApi(request, parsedAuthResult)

  const [region, playerInfo, entitlementToken] = await Promise.all([
    rsoApis('getRegion'),
    rsoApis('getPlayerInfo'),
    getEntitlementToken(rsoApis),
  ])

  const [gameName, tagLine] = [
    playerInfo.acct.game_name,
    playerInfo.acct.tag_line,
  ]

  return {
    gameName,
    tagLine,
    playerInfo,
    entitlementToken,
    parsedAuthResult,
    region: region.affinities.live.toUpperCase() as $Enums.Region,
  }
}

export async function createOrUpadteValorantInfo({
  qq,
  password,
  parsedBody,
  response,
  updateOrCreate,
  toUpdateValorantInfoId,
}: {
  qq: string
  password: string
  parsedBody: AccountBindRequest
  response: ReturnType<typeof useResponse<AccountBindResponse['data']>>
  updateOrCreate: 'update' | 'create'
  toUpdateValorantInfoId?: number
}) {
  const event = useEvent()
  const prisma = usePrisma()

  const [isLoginSuccessful, authResponse, cookies] = await loginRiot(
    qq,
    { ...objectOmit(parsedBody, ['password']), password },
    response,
  )
  if (!isLoginSuccessful) return [false, authResponse] as const

  const {
    gameName,
    tagLine,
    playerInfo,
    parsedAuthResult,
    entitlementToken,
    region,
  } = await getRiotinfo(authResponse)

  const riotPassword = parsedBody.remember
    ? JSON.stringify(encrypt(parsedBody.password))
    : dMd5(parsedBody.password)

  const data = {
    accountQQ: qq,

    // idk why not setiing default value when zod parsed
    alias: parsedBody.alias || 'default',
    remember: parsedBody.remember ?? false,

    cookies: cookies!,
    parsedAuthResult: parsedAuthResult as Prisma.JsonObject,
    entitlementsToken: entitlementToken.entitlements_token,
    riotPassword,
    riotUsername: parsedBody.username,

    uuid: playerInfo.sub,
    country: playerInfo.country,
    tagLine,
    gameName,

    region,
    deleteStatus: false,
  }

  if (updateOrCreate === 'update') {
    event.context.valorantInfo = await prisma.valorantInfo.update({
      data,
      include: { account: true },
      where: { id: toUpdateValorantInfoId },
    })
  } else {
    event.context.valorantInfo = await prisma.valorantInfo.create({
      data,
      include: { account: true },
    })
  }

  return [
    true,
    {
      gameName,
      tagLine,
    },
  ] as const
}
