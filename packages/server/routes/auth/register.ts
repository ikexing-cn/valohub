import { useTranslation } from '@intlify/h3'
import { calculateMd5, registerRequest } from '@valorant-bot/shared'
import type { RegisterTypeDefinitions } from '@valorant-bot/shared'

export default defineTypeSafeEvent<RegisterTypeDefinitions>(registerRequest, async (event) => {
  const dbClient = useDbClient()
  const { email, username, password } = readTypeSafeBody(event)

  const t = await useTranslation(event)

  const foundAccount = await dbClient.account.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (foundAccount) {
    throw createError({
      statusCode: 400,
      message: t('account.exist'),
    })
  }

  await dbClient.account.create({
    data: {
      email,
      password,
      username,
      avatar: `https://www.gravatar.com/avatar/${calculateMd5(email, false)}`,
    },
  })

  return createToken(event, email)
})
