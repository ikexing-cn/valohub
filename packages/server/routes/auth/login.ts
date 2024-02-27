import { useTranslation } from '@intlify/h3'
import { loginRequest } from '@valorant-bot/shared'
import type { LoginTypeDefinitions } from '@valorant-bot/shared'

export default defineTypeSafeEvent<LoginTypeDefinitions>(loginRequest, async (event) => {
  const dbClient = useDbClient()
  const { username, password } = readTypeSafeBody(event)

  const t = await useTranslation(event)

  const foundAccount = await dbClient.account.findFirst({
    where: { username, password },
  })

  if (!foundAccount) {
    throw createError({
      statusCode: 401,
      message: t('account.notExist'),
    })
  }

  return createToken(event, foundAccount.email)
})
