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

    const prisma = usePrisma()
    const response = useResponse()

    const valorantInfo = await prisma.valorantInfo.findFirst({
      where: {
        alias: parsedBody.alias,
        accountQQ: account.qq,
      },
    })

    if (!valorantInfo) {
      if (parsedBody.alias === 'default') {
        return response(false, '请先绑定 Valorant 账号')
      } else {
        return response(
          false,
          `未找到 「${parsedBody.alias}」 绑定的 Valorant 账号`,
        )
      }
    }

    event.context.valorantInfo = valorantInfo
  }
})
