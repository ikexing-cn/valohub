import { useTranslation } from '@intlify/h3'
import { loginRequest } from '@valorant-bot/shared'
import type { LoginTypeDefinitions } from '@valorant-bot/shared'

type Response = LoginTypeDefinitions['response']

export default defineTypeSafeEvent<LoginTypeDefinitions>(loginRequest, async (event) => {
  const dbClient = useDbClient()
  const { username, password } = readTypeSafeBody(event)
  const response = createTypeSafeResponse<Response>(event)

  const t = await useTranslation(event)

  const foundAccount = await dbClient.account.findFirst({
    where: { username, password },
  })

  if (!foundAccount)
    return response.message(401, t('account.notExist'))

  return response.data(200, createToken(event, foundAccount.email))
})
