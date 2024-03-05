import { z } from 'zod'

const bodyInput = z.object({
  password: passwordParser,
  rePassword: passwordParser,
  email: z.string({ required_error: '邮箱不可为空' }).email({ message: '邮箱格式不正确' }).trim(),
  username: z.string({ required_error: '用户名不可为空' }).min(2, { message: '用户名长度不能小于2' }).trim(),
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
      message: '此用户名或邮箱已注册，请直接登录',
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
