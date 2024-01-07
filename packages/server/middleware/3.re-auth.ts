import {
  type AuthResponse,
  createRSOApi,
  parseRSOAuthResultUri,
} from '@valorant-bot/core'
import { delay } from '../utils/delay'

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
      // TODO: 从 valorantInfo 读取值
      // 如果是 remember = true 直接重新登录
      // - 如果有验证码需要用户输入验证码
      // - 如果账号密码错误也需要特殊处理（重新输入账号密码）
      // 如果不是则要求用户重新绑定信息 （账号/密码）
      return response(false, 'Riot 登录已过期，请重新绑定！')
    }
  }
})
