import { type AccountVerifyRequest, accountSchema } from '@valorant-bot/shared'

import type { Prisma } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    account: Prisma.$AccountPayload['scalars']
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = zodParse<AccountVerifyRequest>(accountSchema, body)

  const prisma = usePrisma()
  const response = useResponse()

  let accountExist = await prisma.account.findFirst({
    where: { qq: body.qq },
  })

  if (!accountExist) {
    if (!parsedBody.verifyPassword) {
      return response(false, '此 qq 号需要初始化, 请先设置你的初始化密码！', {
        needInit: true,
      })
    }

    accountExist = await prisma.account.create({
      data: {
        qq: body.qq,
        verifyPassword: dMd5(parsedBody.verifyPassword),
      },
    })
  }

  // check verify password per 10 da
  const updateTime = accountExist.updatedAt.getTime() + 1000 * 60 * 60 * 10
  if (updateTime < Date.now()) {
    if (!parsedBody.verifyPassword) {
      return response(
        false,
        '为了确保获取数据的用户是此 qq 号本人，需要在十天内手动输入一次密码！',
      )
    }

    if (accountExist.verifyPassword !== dMd5(parsedBody.verifyPassword)) {
      return response(false, '验证失败，你输入的密码不正确')
    }
  }

  await prisma.account.update({
    where: { id: accountExist.id },
    data: { updatedAt: new Date() },
  })

  event.context.account = accountExist
})
