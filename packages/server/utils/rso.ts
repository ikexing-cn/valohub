import { type AccountBindRequest, dMd5, objectOmit } from '@valorant-bot/shared'
import {
  MFAError,
  getAccessTokenHeader,
  getEntitlementsToken,
  provideAuthAutoRegion,
  provideClientVersionViaVAPI,
  useProviders,
} from '@tqman/valorant-api-client'

import type { $Enums, Prisma } from '@valorant-bot/server-database'

export async function loginRiot(qq: string, parsedBody: AccountBindRequest) {
  const event = useEvent()

  const { username, password, mfaCode } = parsedBody

  const vapic = await useVapic(qq, parsedBody.alias ?? 'default')

  if (mfaCode != null) {
    await vapic
      .reinitializeWithProviders({
        remote: useProviders([
          provideClientVersionViaVAPI(),
          provideAuthMfaCode(() => ({ code: mfaCode })),
        ]),
      })
      .catch(() => {
        throw new DataWithError('邮箱验证码错误，请重试！', { needRetry: true })
      })
  } else {
    const valorantInfo = event.context?.valorantInfo
    await vapic
      .reinitializeWithProviders({
        remote: useProviders([
          provideClientVersionViaVAPI(),
          provideAuthAutoRegion(username, password),
        ]),
      })
      .catch((error) => {
        if (error instanceof MFAError) {
          throw new DataWithError(
            '检测到此 Valorant 账号已启用二步验证，请输入邮箱验证码',
            {
              needMFA: true,
              riotUsername: valorantInfo?.riotUsername,
            },
          )
        } else {
          throw new DataWithError('此 Valorant 账号或密码错误，请重试！', {
            needRetry: true,
            riotUsername: valorantInfo?.riotUsername,
          })
        }
      })
  }
}

export async function getRiotinfo(qq: string, alias: string) {
  const vapic = await useVapic(qq, alias)
  const remoteOptions = vapic.remote.options

  const [playerInfoResponse, entitlementsToken] = await Promise.all([
    vapic.auth.getPlayerInfo({
      headers: getAccessTokenHeader(remoteOptions.accessToken),
    }),
    getEntitlementsToken(vapic.auth, remoteOptions.accessToken),
  ])

  const [gameName, tagLine] = [
    playerInfoResponse.data.acct.game_name,
    playerInfoResponse.data.acct.tag_line,
  ]

  return {
    gameName,
    tagLine,
    playerInfo: playerInfoResponse.data,
    tokens: {
      entitlementsToken,
      accessToken: remoteOptions.accessToken,
    },
    shard: remoteOptions.shard.toUpperCase() as $Enums.Shard,
    region: remoteOptions.region.toUpperCase() as $Enums.Region,
  }
}

export async function createOrUpadteValorantInfo({
  qq,
  password,
  parsedBody,
  updateOrCreate,
  toUpdateValorantInfoId,
}: {
  qq: string
  password: string
  parsedBody: AccountBindRequest
  updateOrCreate: 'update' | 'create'
  toUpdateValorantInfoId?: number
}) {
  const event = useEvent()
  const prisma = usePrisma()

  await loginRiot(qq, { ...objectOmit(parsedBody, ['password']), password })

  const alias = parsedBody.alias ?? 'default'
  const { gameName, tagLine, playerInfo, shard, region, tokens } =
    await getRiotinfo(qq, alias)

  const riotPassword = parsedBody.remember
    ? JSON.stringify(encrypt(parsedBody.password))
    : dMd5(parsedBody.password)

  const cookies = (await useRedisStorage().getItem(
    getStoreCokiesRedisKey(qq, alias),
  )) as string

  const data = {
    accountQQ: qq,

    alias,
    remember: parsedBody.remember ?? false,

    riotPassword,
    riotUsername: parsedBody.username,

    uuid: playerInfo.sub,
    country: playerInfo.country,
    tagLine,
    gameName,

    cookies,
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

  return {
    gameName,
    tagLine,
  }
}
