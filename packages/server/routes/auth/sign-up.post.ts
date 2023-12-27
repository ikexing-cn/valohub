import { signUpSchema } from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  zodParse(signUpSchema, body)
  const prisma = usePrisma()

  const userExist = await prisma.account.findFirst({ where: { qq: body.qq } })
  if (userExist) throw new Error('此 QQ 号已经注册！')

  await prisma.account.create({
    data: {
      qq: body.qq,
      verifyPassword: dMd5(body.password),
    },
  })

  return '注册成功'
})
