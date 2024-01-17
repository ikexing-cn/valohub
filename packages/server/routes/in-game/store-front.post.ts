import { type InGameStoreFrontResponse, objectOmit } from '@valorant-bot/shared'
import { type SkinsPanelLayout, StoreCostType } from '@valorant-bot/core'
import type { Prisma, PrismaClient } from '@valorant-bot/server-database'

import type * as runtime from '@valorant-bot/server-database/runtime/library'

function transformStoreItems(
  storeItems: Prisma.$StoreItemPayload['scalars'][],
) {
  return storeItems.map((item) =>
    objectOmit(item, ['id']),
  ) as InGameStoreFrontResponse['data']['items']
}

async function getDailyStore(
  db: PrismaClient,
  valorantInfo: Prisma.$ValorantInfoPayload['scalars'],
) {
  const now = new Date()
  const gte = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const dailyStore = await db.storeList.findFirst({
    include: {
      storeListStoreItem: {
        include: {
          storeItem: {
            include: {
              storeListStoreItem: true,
            },
          },
        },
      },
    },
    where: {
      dailyValorantInfoId: valorantInfo.id,
      createdAt: { gte, lt },
    },
  })

  return dailyStore
}

function createStoreItems(
  db: Omit<PrismaClient, runtime.ITXClientDenyList>,
  SkinsPanelLayout: SkinsPanelLayout,
) {
  return Promise.all(
    SkinsPanelLayout.SingleItemStoreOffers.map(async (offer) => {
      const existingItem = await db.storeItem.findUnique({
        where: { uuid: offer.Rewards[0].ItemID },
      })

      if (!existingItem) {
        return db.storeItem.create({
          data: {
            costType: 'VP',
            cost: offer.Cost[StoreCostType.VP],
            uuid: offer.Rewards[0].ItemID,
          },
        })
      }

      return existingItem
    }),
  )
}

export default defineEventHandler(async (event) => {
  const prisma = usePrisma()

  const response = useResponse<InGameStoreFrontResponse['data']>()
  const valorantInfo = event.context.valorantInfo

  const dailyStore = await getDailyStore(prisma, valorantInfo)

  if (dailyStore) {
    return response({
      gameName: valorantInfo.gameName,
      tagLine: valorantInfo.tagLine,
      items: transformStoreItems(
        dailyStore.storeListStoreItem.map((item) =>
          objectOmit(item.storeItem, ['storeListStoreItem']),
        ),
      ),
    })
  }

  const { SkinsPanelLayout } = await useInGame(
    valorantInfo,
    'getStoreFront',
    valorantInfo.uuid,
  )

  const storeItems = await prisma.$transaction(async (client) => {
    const storeItems = await createStoreItems(client, SkinsPanelLayout)

    const storeList = await client.storeList.create({
      include: {
        ValorantInfoDaily: true,
      },
      data: {
        dailyValorantInfoId: valorantInfo.id,
      },
    })

    await client.storeListWithStoreItem.createMany({
      data: storeItems.map((item) => ({
        storeItemId: item.id,
        storeListId: storeList.id,
      })),
    })

    return storeItems
  })

  return response({
    gameName: valorantInfo.gameName,
    tagLine: valorantInfo.tagLine,
    items: transformStoreItems(storeItems),
  })
})
