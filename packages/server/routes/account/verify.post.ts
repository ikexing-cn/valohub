import { dMd5, verifySchema } from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  const response = useResponse()
  const {
    mfaCode,
    remember,
    password: riotPassword,
  } = await useValidatedBody(verifySchema)
  const valorantInfo = event.context.valorantInfo

  if (!valorantInfo)
    return response(false, '未绑定 Valorant 账号')

  const password = !riotPassword || riotPassword === '*'.repeat(16)
    ? decrypt(JSON.parse(valorantInfo.riotPassword))
    : riotPassword

  const { gameName, tagLine } = await createOrUpadteValorantInfo({
    qq: valorantInfo.accountQQ,
    parsedBody: {
      mfaCode,
      remember: remember ?? true,
      password:
        remember ?? true ? JSON.stringify(encrypt(password)) : dMd5(password),
      alias: valorantInfo.alias,
      username: valorantInfo.riotUsername,
    },
    password,
    updateOrCreate: 'update',
    toUpdateValorantInfoId: valorantInfo.id,
  })

  return response(`已成功验证 ${gameName}#${tagLine}, 欢迎继续使用!`)
})
