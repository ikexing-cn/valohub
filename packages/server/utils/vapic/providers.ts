import {
  MFAError,
  type MfaCodeProvider,
  type VapicProvider,
  getEntitlementsToken,
  getRegionAndShardFromPas,
  getTokensUsingCredentials,
  getTokensUsingMfaCode,
  getTokensUsingReauthCookies,
} from '@tqman/valorant-api-client'
import type { Version } from '@tqman/valoffi-api-client'

import { defer, firstValueFrom, retry } from 'rxjs'

/**
 * @client remote
 * @provides client-version
 */
export function provideClientVersionViaDatabase() {
  return (async () => {
    const prisma = usePrisma()
    const version = await prisma.storage.findFirst({ where: { type: 'VERSION' } })
    if (!version)
      throw new Error('No version found in database!')

    const content = version!.content as Version

    return {
      clientVersion: content.riotClientVersion,
    } as const
  }) satisfies VapicProvider
}

/**
 * @client remote
 * @provides access-token, entitlements-token, id-token
 */
export function provideReauth(config: {
  username: string
  password: string
  remember: boolean
}) {
  return (async ({ auth }) => {
    const { username, password, remember } = config
    const valorantInfo = useEvent().context.valorantInfo

    let tokenResult: { accessToken: string, idToken: string }

    try {
      if (valorantInfo.cookies?.includes('ssid=')) {
        const retryGetTokens = defer(() =>
          getTokensUsingReauthCookies(auth),
        ).pipe(
          retry({
            count: 3,
            delay: 1500,
          }),
        )
        tokenResult = await firstValueFrom(retryGetTokens)
      }
    }
    catch {
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

/**
 * @client remote
 * @provides shard, region, access-token, entitlements-token, id-token
 */
export function provideAuthMfaCode(mfaCodeProvider: MfaCodeProvider) {
  return (async ({ auth }) => {
    const { accessToken, idToken } = await getTokensUsingMfaCode(
      auth,
      mfaCodeProvider,
    )

    const entitlementsToken = await getEntitlementsToken(auth, accessToken)

    const { region, shard } = await getRegionAndShardFromPas(
      accessToken,
      idToken,
    )

    return {
      shard,
      region,
      idToken,
      accessToken,
      entitlementsToken,
    } as const
  }) satisfies VapicProvider
}
