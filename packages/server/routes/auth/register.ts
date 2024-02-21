import { useTranslation } from '@intlify/h3'
import { registerRequest } from '@valorant-bot/shared'
import type { RegisterTypeDefinitions } from '@valorant-bot/shared'

type Response = RegisterTypeDefinitions['response']

export default defineTypeSafeEvent<RegisterTypeDefinitions>(registerRequest, async (event) => {
  const dbClient = useDBClient()
  const { email, username } = readTypeSafeBody(event)
  const response = createTypeSafeResponse<Response>(event)

  const t = await useTranslation(event)

  const foundAccount = await dbClient.account.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (foundAccount)
    return response.message(400, t('account.exist'))

  return response.message(400, t('global.unknown'))
})
