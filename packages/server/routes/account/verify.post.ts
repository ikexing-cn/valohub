import {
  type AccountVerifyRequest,
  type AccountVerifyResponse,
  accountSchema,
} from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = zodParse<AccountVerifyRequest>(accountSchema, body)

  const prisma = usePrisma()
  const response = useResponse<AccountVerifyResponse['data']>()

  const accountExist = await prisma.account.findFirst({
    where: { qq: body.qq },
    include: { valorantInfo: true },
  })

  if (!accountExist) {
    if (!parsedBody.password) {
      return response(false, '此 qq 号需要初始化', {
        needInit: true,
      })
    }

    await prisma.account.create({
      data: {
        qq: body.qq,
        verifyPassword: dMd5(body.password),
      },
    })
    return response(true, '初始化成功！接下来请绑定你的 Valorant 账号', {
      needBind: true,
    })
  }

  const updateTime = accountExist.updatedAt.getTime() + 1000 * 60 * 60 * 10
  if (updateTime < Date.now()) {
    if (!parsedBody.password) {
      return response(
        false,
        '为了确保获取数据的用户是此 qq 号本人，需要在十天内手动输入一次密码！',
      )
    }

    if (accountExist.verifyPassword !== dMd5(parsedBody.password)) {
      return response(false, '验证失败，你输入的密码不正确')
    }
  }

  if (accountExist.valorantInfo.length <= 0) {
    return response(
      true,
      '此 qq 号还未绑定 Valorant 账号, 请先绑定至少一个 Valorant  账号！',
      { needBind: true },
    )
  }

  prisma.account.update({
    where: { id: accountExist.id },
    data: { updatedAt: new Date() },
  })

  return response(true, '验证成功')
})
