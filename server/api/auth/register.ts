import { z } from 'zod'
import { useTranslation } from '@intlify/h3'

const bodyInput = z.object({
  password: passwordParser,
  rePassword: passwordParser,
  username: z.string({ required_error: '用户名不可为空' }).trim(),
  email: z.string({ required_error: '邮箱不可为空' }).email({ message: '邮箱格式不正确' }).trim(),
}).refine(data => data.password === data.rePassword, { message: '两次密码不一致' })

export default defineEventHandler(async (event) => {
  const dbClient = useDbClient()
  const { username, password, email } = await readValidatedBody(event, body => bodyInput.parse(body))

  const foundAccount = await dbClient.account.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (foundAccount) {
    throw createError({
      statusCode: 400,
      message: '此账号已注册，青春西门路',
    })
  }

  await dbClient.account.create({
    data: {
      email,
      password,
      username,
    },
  })

  return createToken(email)
})
