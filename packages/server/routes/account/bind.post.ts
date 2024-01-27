import { type AccountBindResponse, bindSchema } from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = await useValidatedBody(bindSchema)

  const account = event.context.account

  const prisma = usePrisma()
  const response = useResponse<AccountBindResponse['data']>()

  const valorantAccountExists = await prisma.valorantInfo.findFirst({
    where: { riotUsername: parsedBody.username },
  })
  if (valorantAccountExists && !valorantAccountExists.deleteStatus) {
    return response(false, '此 Valorant 账号已被其他 qq 绑定！', {
      isBinded: true,
    })
  }

  const valorantInfoExists = await prisma.valorantInfo.findFirst({
    where: { accountQQ: account.qq, alias: parsedBody.alias },
  })
  if (valorantInfoExists && !valorantInfoExists.deleteStatus) {
    return response(
      false,
      `${
        parsedBody.alias === 'default' ? '默认' : '此'
      }别名已绑定其他 Valorant 账号，请更换别名！`,
      {
        isBinded: true,
      },
    )
  }

  const isUpdate = valorantAccountExists && valorantAccountExists.deleteStatus
  const { gameName, tagLine } = await createOrUpadteValorantInfo({
    qq: account.qq,
    parsedBody,
    password: body.password,
    updateOrCreate: isUpdate ? 'update' : 'create',
    toUpdateValorantInfoId: isUpdate ? valorantAccountExists.id : undefined,
  })

  return response(`已成功绑定 ${gameName}#${tagLine}, 欢迎使用!`)
})
