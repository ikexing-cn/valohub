import { selectValoInfoSchema } from '@valorant-bot/shared'
import type { Prisma } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    valorantInfo: Prisma.$ValorantInfoPayload['scalars']
  }
}

export default defineEventHandler(async (event) => {
  const account = event.context.account
  if (account && !getRequestURL(event).pathname.startsWith('/account')) {
    const body = await readBody(event)
    const parsedBody = zodParse(selectValoInfoSchema, body)
    const alias = parsedBody.alias || 'default'

    const prisma = usePrisma()
    const response = useResponse()

    const valorantInfo = await prisma.valorantInfo.findFirst({
      where: {
        alias,
        accountQQ: account.qq,
      },
    })

    if (!valorantInfo) {
      return response(false, '请先绑定你的 Valorant 账号', {
        needBind: true,
      })
    }

    event.context.valorantInfo = valorantInfo
  }
})
