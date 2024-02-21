import { useTranslation } from '@intlify/h3'
import type { Account } from '@valorant-bot/server-database'

declare module 'h3' {
  interface H3EventContext {
    user: Account
  }
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  if (pathname.includes('/auth') || pathname === '/')
    return

  const dbClient = useDbClient()
  const response = createTypeSafeResponse(event)
  const email = await validateAndExtractTokenFromHeader(event)

  const foundAccount = await dbClient.account.findUnique({ where: { email } })
  if (!foundAccount) {
    const t = await useTranslation(event)
    return response.message(401, t('global.invalidToken'))
  }

  event.context.user = foundAccount
})
