import {
  type AccountBindRequest,
  type AccountBindResponse,
  bindSchema,
  objectOmit,
} from '@valorant-bot/shared'
import type { Prisma } from '@prisma/client'

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
  if (valorantInfoExists) {
    return response(false, '默认别名已绑定其他 Valorant 账号，请更换别名！', {
      isBinded: true,
    })
  }

  const [isLoginSuccessful, authResponse, cookies] = await loginRiot(
    account.qq,
    { ...objectOmit(parsedBody, ['password']), password: body.password },
    response,
  )
  if (!isLoginSuccessful) return authResponse

  const {
    gameName,
    tagLine,
    playerInfo,
    parsedAuthResult,
    entitlementToken,
    region,
  } = await getRiotinfo(authResponse)

  const data = {
    accountQQ: account.qq,

    // idk why not setiing default value when zod parsed
    alias: parsedBody.alias || 'default',
    remember: parsedBody.remember ?? false,

    cookies,
    parsedAuthResult: parsedAuthResult as Prisma.JsonObject,
    entitlementsToken: entitlementToken.entitlements_token,
    riotUsername: parsedBody.username,
    riotPassword: parsedBody.password,

    uuid: playerInfo.sub,
    country: playerInfo.country,
    tagLine: playerInfo.acct.tag_line,
    gameName: playerInfo.acct.game_name,

    region,
    deleteStatus: false,
  }

  if (valorantAccountExists && valorantAccountExists.deleteStatus) {
    await prisma.valorantInfo.update({
      data,
      include: { account: true },
      where: { id: valorantAccountExists.id },
    })
  } else {
    await prisma.valorantInfo.create({ data, include: { account: true } })
  }

  return response(`已成功绑定 ${gameName}#${tagLine}, 欢迎使用!`)
})
