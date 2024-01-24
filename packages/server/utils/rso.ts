import {
  type AccountBindRequest,
  type AccountBindResponse,
  dMd5,
  objectOmit,
} from '@valorant-bot/shared'
import {
  type AuthTokenResponse,
  type ValorantAuthResponse,
  getEntitlementsToken,
  getRegionAndShardFromPas,
  isMfaResponse,
  isTokenResponse,
  parseTokensFromUri,
} from '@tqman/valorant-api-client'

import type { $Enums, Prisma } from '@valorant-bot/server-database'

export async function loginRiot(
  qq: string,
  parsedBody: AccountBindRequest,
  response: ReturnType<typeof useResponse<AccountBindResponse['data']>>,
) {
  const event = useEvent()

  let authLoginResult
  const { username, password, mfaCode, remember = false } = parsedBody

  const vapic = await useVapic(qq, parsedBody.alias ?? 'default')

  if (mfaCode != null) {
    authLoginResult =
      await vapic.auth.putMultiFactorAuthentication<ValorantAuthResponse>({
        data: {
          code: mfaCode,
          rememberDevice: remember,
          type: 'multifactor',
        },
      })

    if (!isTokenResponse(authLoginResult)) {
      return [
        false,
        response(false, '邮箱验证码错误，请重试！', { needRetry: true }),
      ] as const
    }
  } else {
    const valorantInfo = event.context?.valorantInfo
    await vapic.auth.postAuthCookies({
      data: {
        client_id: 'play-valorant-web-prod',
        nonce: '1',
        redirect_uri: 'https://playvalorant.com/opt_in',
        response_type: 'token id_token',
        scope: 'account openid',
      },
    })
    authLoginResult = await vapic.auth.putAuthRequest<ValorantAuthResponse>({
      data: {
        remember,
        username,
        password,
        type: 'auth',
        language: 'en_US',
      },
    })

    if (isMfaResponse(authLoginResult)) {
      return [
        false,
        response(
          false,
          '检测到此 Valorant 账号已启用二步验证，请输入邮箱验证码',
          {
            needMFA: true,
            riotUsername: valorantInfo?.riotUsername,
          },
        ),
      ] as const
    } else if (!isTokenResponse(authLoginResult)) {
      return [
        false,
        response(false, '此 Valorant 账号或密码错误，请重试！', {
          needRetry: true,
          riotUsername: valorantInfo?.riotUsername,
        }),
      ] as const
    }
  }

  return [true, authLoginResult] as const
}

export async function getRiotinfo(
  authResponse: AuthTokenResponse,
  qq: string,
  alias: string,
) {
  const parsedAuthResult = parseTokensFromUri(
    authResponse.response.parameters.uri,
  )
  const vapic = await useVapic(qq, alias)

  const [playerInfoResponse, regionResponse, entitlementsToken] =
    await Promise.all([
      vapic.auth.getPlayerInfo({
        headers: {
          Authorization: `Bearer ${parsedAuthResult.accessToken}`,
        },
      }),
      getRegionAndShardFromPas(
        parsedAuthResult.accessToken,
        parsedAuthResult.idToken,
      ),
      getEntitlementsToken(vapic.auth, parsedAuthResult.accessToken),
    ])

  const [gameName, tagLine] = [
    playerInfoResponse.data.acct.game_name,
    playerInfoResponse.data.acct.tag_line,
  ]

  return {
    gameName,
    tagLine,
    playerInfo: playerInfoResponse.data,
    tokens: { entitlementsToken, ...parsedAuthResult },
    shard: regionResponse.shard.toUpperCase() as $Enums.Shard,
    region: regionResponse.region.toUpperCase() as $Enums.Region,
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

  const [isLoginSuccessful, authResponse] = await loginRiot(
    qq,
    { ...objectOmit(parsedBody, ['password']), password },
    response,
  )
  if (!isLoginSuccessful) return [false, authResponse] as const

  const { gameName, tagLine, playerInfo, shard, region, tokens } =
    await getRiotinfo(
      authResponse.data as AuthTokenResponse,
      qq,
      parsedBody.alias ?? 'default',
    )

  const riotPassword = parsedBody.remember
    ? JSON.stringify(encrypt(parsedBody.password))
    : dMd5(parsedBody.password)

  const data = {
    accountQQ: qq,

    // idk why not setiing default value when zod parsed
    alias: parsedBody.alias || 'default',
    remember: parsedBody.remember ?? false,

    riotPassword,
    riotUsername: parsedBody.username,

    uuid: playerInfo.sub,
    country: playerInfo.country,
    tagLine,
    gameName,

    tokens: tokens as Prisma.JsonObject,

    shard,
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
