import type { Prisma } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    user: Prisma.$AccountPayload['scalars']
  }
}

export default defineEventHandler(async (event) => {
  if (['/api/auth/login', '/api/auth/register'].includes(event.path) || !event.path.startsWith('/api'))
    return

  const dbClient = useDbClient()
  const email = await validateAndExtractTokenFromHeader()
  const user = await dbClient.account.findUnique({ where: { email } })

  if (!user)
    throw createError({ status: 401, message: '请先登录！' })

  event.context.user = user
})
