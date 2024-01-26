import { aliasOnlySchema } from '@valorant-bot/shared'
import type { Prisma } from '@valorant-bot/server-database'

declare module 'h3' {
  interface H3EventContext {
    valorantInfo: Prisma.$ValorantInfoPayload['scalars']
  }
}

const skipPaths = ['/account/bind']

export default defineEventHandler(async (event) => {
  const account = event.context.account
  const pathname = getRequestURL(event).pathname
  if (account && !skipPaths.some((path) => pathname.startsWith(path))) {
    const parsedBody = await useValidatedBody(aliasOnlySchema)

    const prisma = usePrisma()
    const valorantInfo = await prisma.valorantInfo.findFirst({
      where: {
        alias: parsedBody.alias,
        accountQQ: account.qq,
        deleteStatus: false,
      },
    })

    if (!valorantInfo) {
      if (parsedBody.alias === 'default') {
        throw new Error('请先进行 Valorant 账号绑定')
      } else {
        throw new Error(`未找到 「${parsedBody.alias}」 绑定的 Valorant 账号`)
      }
    }

    event.context.valorantInfo = valorantInfo
  }
})
