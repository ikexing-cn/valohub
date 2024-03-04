import { z } from 'zod'

const bodyInput = z.object({
  password: passwordParser,
  username: z.string().trim(),
})

export default defineEventHandler(async (event) => {
  const dbClient = useDbClient()
  const { username, password } = await readValidatedBody(event, body => bodyInput.parse(body))

  const foundAccount = await dbClient.account.findFirst({
    where: { username, password },
  })

  if (!foundAccount) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码不正确',
    })
  }

  return createToken(foundAccount.email)
})
