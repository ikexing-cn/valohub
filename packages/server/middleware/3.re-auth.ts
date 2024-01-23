import {
  type AuthApiClient,
  getEntitlementsToken,
  getTokensUsingReauthCookies,
} from '@tqman/valorant-api-client'
import type { Prisma } from '@valorant-bot/server-database'

function tryGetCookieReauth(authClient: AuthApiClient, counts = 0) {
  try {
    return getTokensUsingReauthCookies(authClient)
  } catch {
    if (counts > 3) {
      return 'Riot 登录已过期, 请重新验证账户!'
    }
    tryGetCookieReauth(authClient, counts)
  } finally {
    counts++
  }
}

export default defineEventHandler(async (event) => {
  const valorantInfo = event.context.valorantInfo

  if (
    valorantInfo &&
    valorantInfo.updatedAt.getTime() + 1000 * 60 * 30 < Date.now()
  ) {
    const prisma = usePrisma()
    const response = useResponse()

    const vapic = await useVapic()

    if (!getRequestURL(event).pathname.startsWith('/account/verify')) {
      const cookieReauthResponse = await tryGetCookieReauth(vapic.auth)
      if (typeof cookieReauthResponse === 'string') {
        return response(false, cookieReauthResponse)
      } else {
        const { accessToken, idToken } = cookieReauthResponse!
        const entitlementsToken = await getEntitlementsToken(
          vapic.auth,
          accessToken,
        )
        const tokens = {
          accessToken,
          idToken,
          entitlementsToken,
        }

        event.context.valorantInfo = await prisma.valorantInfo.update({
          data: {
            tokens: tokens as Prisma.JsonObject,
          },
          where: {
            id: valorantInfo.id,
          },
        })
      }
    }
  }
})
