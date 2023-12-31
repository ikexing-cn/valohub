import { type InGameStoreFrontResponse, objectOmit } from '@valorant-bot/shared'
import { StoreCostType } from '@valorant-bot/core'
import type { Prisma } from '@prisma/client'

function transformStoreItems(
  storeItems: Prisma.$StoreItemPayload['scalars'][],
) {
  return storeItems.map((item) => objectOmit(item, ['id', 'storeListId']))
}

export default defineEventHandler(async (event) => {
  const prisma = usePrisma()
  const response = useResponse<InGameStoreFrontResponse['data']>()
  const valorantInfo = event.context.valorantInfo

  const now = new Date()
  const gte = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const dailyStore = await prisma.storeList.findFirst({
    include: {
      storeItems: true,
    },
    where: {
      dailyValorantInfoId: valorantInfo.id,
      createdAt: { gte, lt },
    },
  })

  if (dailyStore)
    return response({
      skinItems: transformStoreItems(dailyStore.storeItems),
    })

  const { SkinsPanelLayout } = await useInGame(
    valorantInfo,
    'getStoreFront',
    valorantInfo.uuid,
  )

  const storeList = await prisma.storeList.create({
    include: {
      storeItems: true,
      ValorantInfoDaily: true,
    },
    data: {
      storeItems: {
        createMany: {
          data: SkinsPanelLayout.SingleItemStoreOffers.map((offer) => ({
            costType: 'VP',
            cost: offer.Cost[StoreCostType.VP],
            uuid: offer.Rewards[0].ItemID,
          })),
        },
      },
      dailyValorantInfoId: valorantInfo.id,
    },
  })

  return response({ skinItems: transformStoreItems(storeList.storeItems) })
})
