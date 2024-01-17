import {
  type AuthResponse,
  createRSOApi,
  parseRSOAuthResultUri,
} from '@valorant-bot/core'

async function reauth(cookies: string[]) {
  const response = await fetch(
    'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1',
    {
      method: 'GET',
      redirect: 'manual',
      headers: {
        Cookie: cookies.join('; '),
      },
    },
  )

  return response
}

function isReauthSuccessful(response: Response) {
  return (
    response.headers
      .get('location')
      ?.startsWith('https://playvalorant.com/opt_in') === true
  )
}

export default defineEventHandler(async (event) => {
  const valorantInfo = event.context.valorantInfo

  if (
    valorantInfo &&
    valorantInfo.updatedAt.getTime() + 1000 * 60 * 30 < Date.now()
  ) {
    const prisma = usePrisma()
    const response = useResponse()
    const reauthResponse = await reauth(valorantInfo.cookies)

    if (isReauthSuccessful(reauthResponse)) {
      const authResponse: AuthResponse = {
        type: 'response',
        response: {
          parameters: {
            uri: reauthResponse.headers.get('location')!,
          },
        },
      }

      const parsedAuthResult = parseRSOAuthResultUri(authResponse)
      const { entitlements_token } = await getEntitlementToken(
        createRSOApi(useRequest()),
        parsedAuthResult,
      )

      const updatedValorantInfo = await prisma.valorantInfo.update({
        where: {
          id: valorantInfo.id,
        },
        data: {
          parsedAuthResult,
          entitlementsToken: entitlements_token,
        },
      })

      event.context.valorantInfo = updatedValorantInfo
    } else {
      if (!valorantInfo.remember) {
        return response(false, 'Riot 登录已过期, 请重新验证账户！', {
          needReauth: true,
        })
      }

      const password = decrypt(JSON.parse(valorantInfo.riotPassword))

      const [isSuccess, result] = await createOrUpadteValorantInfo({
        qq: valorantInfo.accountQQ,
        parsedBody: {
          alias: valorantInfo.alias,
          username: valorantInfo.riotUsername,
          password,
          remember: true,
        },
        password,
        response,
        updateOrCreate: 'update',
        toUpdateValorantInfoId: valorantInfo.id,
      })

      if (!isSuccess) return result
    }
  }
})
