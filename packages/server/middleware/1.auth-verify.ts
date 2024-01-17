import { accountSchema } from '@valorant-bot/shared'

import type { Prisma } from '@valorant-bot/server-database'

declare module 'h3' {
  interface H3EventContext {
    account: Prisma.$AccountPayload['scalars']
  }
}

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') {
    const parsedBody = await useValidatedBody(accountSchema)

    const prisma = usePrisma()
    const response = useResponse()

    let accountExist = await prisma.account.findFirst({
      where: { qq: parsedBody.qq },
    })

    if (
      parsedBody.verifyPassword &&
      accountExist &&
      accountExist.verifyPassword !== parsedBody.verifyPassword
    ) {
      await prisma.account.update({
        where: { id: accountExist.id },
        data: { needVerify: true },
      })
      return response(false, '验证失败，你输入的密码不正确')
    }

    if (!accountExist) {
      if (!parsedBody.verifyPassword) {
        return response(
          false,
          '此 qq 号需要初始化, 请先输入你的初始化密码！「此密码仅限用于 ValoranBot 进行验证, 非 Riot 密码」',
          {
            needInit: true,
          },
        )
      }

      accountExist = await prisma.account.create({
        data: {
          qq: parsedBody.qq,
          verifyPassword: parsedBody.verifyPassword,
        },
      })
    }

    // check verify password per 10 day
    const updateTime =
      accountExist.updatedAt.getTime() + 1000 * 60 * 60 * 24 * 10
    if (updateTime < Date.now() || accountExist.needVerify) {
      if (!parsedBody.verifyPassword) {
        return response(
          false,
          '为了确保获取数据的用户是此 qq 号本人，需要在十天内手动输入一次注册的初始化密码！「此密码仅限用于 ValoranBot 进行验证, 非 Riot 密码」',
          { needVerify: true },
        )
      }

      if (accountExist.verifyPassword !== parsedBody.verifyPassword) {
        await prisma.account.update({
          where: { id: accountExist.id },
          data: { needVerify: true },
        })
        return response(false, '验证失败，你输入的密码不正确')
      }
    }

    await prisma.account.update({
      where: { id: accountExist.id },
      data: { updatedAt: new Date() },
    })

    event.context.account = accountExist
  }
})
