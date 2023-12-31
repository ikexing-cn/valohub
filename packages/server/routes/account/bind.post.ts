import {
  type AccountBindResponse,
  type AccountBindSchema,
  bindSchema,
} from '@valorant-bot/shared'
import { objectOmit } from '../../../shared/src/utils/internal'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = zodParse<AccountBindSchema>(bindSchema, body)

  const account = event.context.account

  const prisma = usePrisma()
  const response = useResponse<AccountBindResponse['data']>()

  const valorantAccountExists = await prisma.valorantInfo.findFirst({
    where: { riotUsername: parsedBody.username },
  })
  if (valorantAccountExists) {
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

  const [isSuccess, authResponse, cookies] = await loginRiot(
    account.qq,
    { ...objectOmit(parsedBody, ['password']), password: body.password },
    response,
  )
  if (!isSuccess) return authResponse

  const {
    gameName,
    tagLine,
    playerInfo,
    parsedAuthResult,
    entitlementToken,
    region,
  } = await getRiotinfo(authResponse)

  await prisma.valorantInfo.create({
    include: { account: true },
    data: {
      accountQQ: account.qq,

      alias: parsedBody.alias,
      remember: parsedBody.remember ?? false,

      cookies,
      parsedAuthResult: JSON.stringify(parsedAuthResult),
      entitlementsToken: entitlementToken.entitlements_token,
      riotUsername: parsedBody.username,
      riotPassword: parsedBody.password,

      uuid: playerInfo.sub,
      country: playerInfo.country,
      tagLine: playerInfo.acct.tag_line,
      gameName: playerInfo.acct.game_name,

      region,
    },
  })

  return response(`已成功绑定 ${gameName}#${tagLine}, 欢迎使用!`)
})
