import { aliasOnlySchema } from '@valorant-bot/shared'
import type { Prisma } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    valorantInfo: Prisma.$ValorantInfoPayload['scalars']
  }
}

export default defineEventHandler(async (event) => {
  const account = event.context.account
  const pathname = getRequestURL(event).pathname
  if (
    account &&
    !(
      pathname.startsWith('/account/bind') &&
      pathname.startsWith('/account/auth')
    )
  ) {
    const parsedBody = await useValidatedBody(aliasOnlySchema)

    const prisma = usePrisma()
    const response = useResponse()

    const valorantInfo = await prisma.valorantInfo.findFirst({
      where: {
        alias: parsedBody.alias,
        accountQQ: account.qq,
        deleteStatus: false,
      },
    })

    if (!valorantInfo) {
      if (parsedBody.alias === 'default') {
        return response(false, '请先进行 Valorant 账号绑定')
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
