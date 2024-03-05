import { z } from 'zod'

const passwordParser = z.string({ required_error: '密码不可为空' })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.,?]).{8,}$/, '密码必须包含大小写字母、数字和特殊符号, 且长度必须大于6')
  .trim()
  .transform(v => calculateMd5(v))

export const bodyInput = z.object({
  email: z.string().email().trim(),
  password: passwordParser,
})

export default defineEventHandler(async (event) => {
  const dbClient = useDbClient()
  const { email, password } = await readValidatedBody(event, body => bodyInput.parse(body))

  const foundAccount = await dbClient.account.findFirst({
    where: { email, password },
  })

  if (!foundAccount) {
    throw createError({
      statusCode: 401,
      message: '邮箱或密码不正确',
    })
  }

  return createToken(foundAccount.email)
})
