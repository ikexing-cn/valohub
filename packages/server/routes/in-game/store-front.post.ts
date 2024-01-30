import {
  type CostType,
  type InGameStoreFrontResponse,
  type ResponseStoreItem,
  StoreCostType,
  calcDailyTime,
  calcWeeklyTime,
  objectOmit,
} from '@valorant-bot/shared'
import type { StorefrontResponse } from '@tqman/valorant-api-client/types'
import type {
  Prisma,
  PrismaClient,
  StoreItem,
  StoreList,
  runtime,
} from '@valorant-bot/server-database'

function transformStoreItems<T extends CostType = 'VP'>(
  storeItems: StoreItem[],
) {
  return storeItems.map(
    (item) => objectOmit(item, ['id']) as ResponseStoreItem<T>,
  )
}

async function getStoreFrontToday(
  client: PrismaClient,
  valorantInfo: Prisma.$ValorantInfoPayload['scalars'],
) {
  const machtes = {
    storeListStoreItem: {
      include: {
        storeItem: {
          include: {
            storeListStoreItem: true,
          },
        },
      },
    },
  }

  const dailyStoreItems = await client.storeList.findFirst({
    include: machtes,
    where: {
      useAt: calcDailyTime(),
      dailyValorantInfoId: valorantInfo.id,
    },
  })

  const accessoryStoreItems = await client.storeList.findFirst({
    include: machtes,
    where: {
      useAt: calcWeeklyTime(),
      accessoryValorantInfoId: valorantInfo.id,
    },
  })

  return {
    dailyStoreItems,
    accessoryStoreItems,
  }
}

function getOrCreateDailyStoreItems(
  client: Omit<PrismaClient, runtime.ITXClientDenyList>,
  skinPanelLayout: StorefrontResponse['SkinsPanelLayout'],
) {
  return Promise.all(
    skinPanelLayout.SingleItemStoreOffers.map(async (offer) => {
      const existingItem = await client.storeItem.findUnique({
        where: { uuid: offer.Rewards[0].ItemID },
      })

      if (!existingItem) {
        return client.storeItem.create({
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

function getOrCreateAccessoryStoreItems(
  db: Omit<PrismaClient, runtime.ITXClientDenyList>,
  AccessoryStore: StorefrontResponse['AccessoryStore'],
) {
  return Promise.all(
    AccessoryStore.AccessoryStoreOffers.map(async (offer) => {
      const existingItem = await db.storeItem.findUnique({
        where: { uuid: offer.Offer.Rewards[0].ItemID },
      })

      if (!existingItem) {
        return db.storeItem.create({
          data: {
            costType: 'KC',
            // @ts-expect-error - it's like zod parse error
            cost: offer.Offer.Cost[StoreCostType.KC],
            uuid: offer.Offer.Rewards[0].ItemID,
          },
        })
      }

      return existingItem
    }),
  )
}

// function getOrCreateBonusStoreItems(
//   db: Omit<PrismaClient, runtime.ITXClientDenyList>,
//   BonusStore: StorefrontResponse['BonusStore'],
// ) {
//   return Promise.all(
//     BonusStore?.BonusStoreOffers.map(async (offer) => {
//       const existingItem = await db.storeItem.findUnique({
//         where: { uuid: offer.Offer.Rewards[0].ItemID },
//       })

//       if (!existingItem) {
//         return db.storeItem.create({
//           data: {
//             costType: 'VP',
//             percent: offer.DiscountPercent,
//             cost: offer.Offer.Cost[StoreCostType.VP],
//             uuid: offer.Offer.Rewards[0].ItemID,
//           },
//         })
//       }

//       return existingItem
//     }) ?? [],
//   )
// }

async function createAndLinkStoreItems(
  client: Omit<PrismaClient, runtime.ITXClientDenyList>,
  storeItems: StoreItem[],
  storeType: 'daily' | 'bonus' | 'accessory',
) {
  const valorantInfo = useEvent().context.valorantInfo

  let storeList: StoreList | null = null
  if (storeType === 'daily') {
    storeList = await client.storeList.create({
      include: {
        ValorantInfoDaily: true,
      },
      data: {
        type: 'DAILY',
        useAt: calcDailyTime(),
        dailyValorantInfoId: valorantInfo.id,
      },
    })
  } else if (storeType === 'accessory') {
    storeList = await client.storeList.create({
      include: {
        ValorantInfoAccessory: true,
      },
      data: {
        type: 'ACCESSORY',
        useAt: calcWeeklyTime(),
        accessoryValorantInfoId: valorantInfo.id,
      },
    })
  }

  if (storeList != null) {
    await client.storeListWithStoreItem.createMany({
      data: storeItems.map((item) => ({
        storeItemId: item.id,
        storeListId: storeList!.id,
      })),
    })
  }
}

export default defineEventHandler(async (event) => {
  const prisma = usePrisma()
  const valorantInfo = event.context.valorantInfo
  const response = useResponse<InGameStoreFrontResponse['data']>()
  const toResponse = await getStoreFrontToday(prisma, valorantInfo)

  if (toResponse.dailyStoreItems && toResponse.accessoryStoreItems) {
    const result = response({
      gameName: valorantInfo.gameName,
      tagLine: valorantInfo.tagLine,
      dailyStoreItems: transformStoreItems(
        toResponse.dailyStoreItems.storeListStoreItem.map((item) =>
          objectOmit(item.storeItem, ['storeListStoreItem']),
        ),
      ),
      accessoryStoreItems: transformStoreItems<'KC'>(
        toResponse.accessoryStoreItems.storeListStoreItem.map((item) =>
          objectOmit(item.storeItem, ['storeListStoreItem']),
        ),
      ),
    })
    return result
  }

  const vapic = await useVapic(valorantInfo.accountQQ, valorantInfo.alias)
  const {
    data: { SkinsPanelLayout, AccessoryStore },
  } = await vapic.remote.getStorefront({ data: { puuid: valorantInfo.uuid } })

  const [dailyStoreItems, accessoryStoreItems] = await prisma.$transaction(
    async (client) => {
      const [dailyStoreItems, accessoryStoreItems] = await Promise.all([
        getOrCreateDailyStoreItems(client, SkinsPanelLayout),
        getOrCreateAccessoryStoreItems(client, AccessoryStore),
      ])

      await createAndLinkStoreItems(client, dailyStoreItems, 'daily')
      await createAndLinkStoreItems(client, accessoryStoreItems, 'accessory')

      return [dailyStoreItems, accessoryStoreItems]
    },
  )

  return response({
    gameName: valorantInfo.gameName,
    tagLine: valorantInfo.tagLine,
    dailyStoreItems: transformStoreItems(dailyStoreItems),
    accessoryStoreItems: transformStoreItems(accessoryStoreItems),
  })
})
