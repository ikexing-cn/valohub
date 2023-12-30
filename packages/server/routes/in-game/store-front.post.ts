import {
  type InGameStoreFrontResponse,
  storeFrontSchema,
} from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsedBody = zodParse(storeFrontSchema, body)
  const alias = parsedBody.alias || 'default'

  const prisma = usePrisma()
  const response = useResponse<InGameStoreFrontResponse['data']>()
  const account = event.context.account

  const valorantInfo = await prisma.valorantInfo.findFirst({
    where: {
      alias,
      accountQQ: account.qq,
    },
  })

  if (!valorantInfo) {
    return response(false, '请先绑定你的 Valorant 账号', {
      needBind: true,
    })
  }

  const now = new Date()
  const gte = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const dailyStore = await prisma.storeItems.findFirst({
    where: {
      dailyValorantInfoId: valorantInfo.id,
      createdAt: { gte, lt },
    },
  })

  if (dailyStore) return response({ skinItems: dailyStore.items })

  const {
    SkinsPanelLayout: { SingleItemOffers },
  } = await useInGame(valorantInfo, 'getStoreFront', valorantInfo.uuid)

  await prisma.storeItems.create({
    include: {
      ValorantInfoDaily: true,
    },
    data: {
      items: SingleItemOffers,
      dailyValorantInfoId: valorantInfo.id,
    },
  })

  return response({ skinItems: SingleItemOffers })
})
