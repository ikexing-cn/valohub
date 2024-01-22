import { verifySchema } from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  const response = useResponse()
  const {
    mfaCode,
    remember,
    password: riotPassword,
  } = await useValidatedBody(verifySchema)
  const valorantInfo = event.context.valorantInfo

  if (!valorantInfo) {
    return response(false, '未绑定 Valorant 账号')
  }

  const password =
    !riotPassword || riotPassword === '*'.repeat(16)
      ? decrypt(JSON.parse(valorantInfo.riotPassword))
      : riotPassword

  const [isSuccess, result] = await createOrUpadteValorantInfo({
    qq: valorantInfo.accountQQ,
    parsedBody: {
      mfaCode,
      password,
      remember: remember ?? true,
      alias: valorantInfo.alias,
      username: valorantInfo.riotUsername,
    },
    password,
    response,
    updateOrCreate: 'update',
    toUpdateValorantInfoId: valorantInfo.id,
  })

  if (!isSuccess) return result

  return response('验证成功，欢迎继续使用!')
})
