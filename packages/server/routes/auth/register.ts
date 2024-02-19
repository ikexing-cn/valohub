import { registerRequest } from '@valorant-bot/shared'
import type { RegisterTypeDefinitions } from '@valorant-bot/shared'

type Response = RegisterTypeDefinitions['response']

export default defineTypeSafeEvent<RegisterTypeDefinitions>(registerRequest, async (event) => {
  const dbClient = useDBClient()
  const response = createTypeSafeResponse<Response>(event)
  const { email, username } = readTypeSafeBody(event)

  const foundAccount = await dbClient.account.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (foundAccount)
    return response.message(400, '用户已存在, 请重新注册')

  return response.message(400, '未知错误？')
})
