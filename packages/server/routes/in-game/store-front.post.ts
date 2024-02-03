import {
  type InGameStoreFrontResponse,
  type ResponseStoreItem,
  type TCategory,
  type TWeapon,
  calcDailyTime,
  calcWeeklyTime,
  isEmptyArray,
} from '@valorant-bot/shared'

import { lastValueFrom, map, of, zip } from 'rxjs'
import type {
  Prisma,
  PrismaClient,
  StoreType,
} from '@valorant-bot/server-database'

function transformWeaponItems(type: StoreType, items: string[]) {
  const event = useEvent()
  const prisma = usePrisma()
  const language = event.context.language
  // const valorantInfo = event.context.valorantInfo

  return Promise.all(
    items.map(async (item) => {
      const [{ category, weapon_info: weaponInfo }]: [
        { category: TCategory, weapon_info: TWeapon },
      ] = await prisma.$queryRaw`
        SELECT 
          content_element - 'skins' - 'weaponStats' - 'shopData' AS category,
          levels_element AS weapon_info
        FROM 
          "Storage",
          jsonb_array_elements(content) AS content_element,
          jsonb_array_elements(content_element -> 'skins') AS skins_element,
          jsonb_array_elements(skins_element -> 'levels') AS levels_element
        WHERE language = ${language}
          AND type = 'WEAPON'
          AND levels_element ->> 'uuid' = ${item}
      `

      const [{ cost }]: [{ cost: number }] = await prisma.$queryRaw`
        SELECT
          item ->> 'cost' AS cost
        FROM
          "Storage",
          jsonb_array_elements(content -> ${category.uuid}) AS item
        WHERE
          type = 'WEAPON_PRICE'
          AND item @> jsonb_build_object('uuid', ${weaponInfo.uuid})
      `

      return {
        category,
        weaponInfo,
        discountPercent: 0,
        cost: Number(cost),
        costType: type === 'ACCESSORY' ? 'KC' : 'VP',
      } satisfies ResponseStoreItem
    }),
  )
}

async function getStoreList(
  client: PrismaClient,
  valorantInfo: Prisma.$ValorantInfoPayload['scalars'],
) {
  const dailyStoreItems = await client.storeList.findFirst({
    include: {
      ValorantInfoDaily: true,
    },
    where: {
      type: 'DAILY',
      useAt: calcDailyTime(),
      dailyValorantInfoId: valorantInfo.id,
    },
  })

  const accessoryStoreItems = await client.storeList.findFirst({
    include: {
      ValorantInfoAccessory: true,
    },
    where: {
      type: 'BONUS',
      useAt: calcWeeklyTime(),
      accessoryValorantInfoId: valorantInfo.id,
    },
  })

  return {
    dailyStoreItems,
    accessoryStoreItems,
  }
}

export default defineEventHandler(async (event) => {
  const prisma = usePrisma()
  const valorantInfo = event.context.valorantInfo
  const response = useResponse<InGameStoreFrontResponse['data']>()
  const toResponse = await getStoreList(prisma, valorantInfo)

  const toResult: InGameStoreFrontResponse['data'] = {
    gameName: valorantInfo.gameName,
    tagLine: valorantInfo.tagLine,
    dailyStoreItems: [],
    accessoryStoreItems: [],
  }

  if (toResponse.dailyStoreItems) {
    toResult.dailyStoreItems = await transformWeaponItems(
      'DAILY',
      toResponse.dailyStoreItems.items,
    )
  }

  // if (toResponse.accessoryStoreItems) {
  //   toResult.accessoryStoreItems = await transformWeaponItems(
  //     'ACCESSORY',
  //     toResponse.accessoryStoreItems.items,
  //   )
  // }

  const checkIfResultIsNotEmpty$ = zip(
    of(toResult.dailyStoreItems),
    // of(toResult.accessoryStoreItems),
  ).pipe(map(result => result.every(arr => !isEmptyArray(arr))))

  if (await lastValueFrom(checkIfResultIsNotEmpty$))
    return response(toResult)

  // ==============================================================================

  const vapic = await useVapic(valorantInfo.accountQQ, valorantInfo.alias)
  const {
    data: { SkinsPanelLayout /** AccessoryStore */ },
  } = await vapic.remote.getStorefront({ data: { puuid: valorantInfo.uuid } })

  if (isEmptyArray(toResult.dailyStoreItems)) {
    const items = SkinsPanelLayout.SingleItemStoreOffers.map(
      offer => offer.Rewards[0].ItemID,
    )
    await prisma.storeList.create({
      data: {
        items,
        type: 'DAILY',
        useAt: calcDailyTime(),
        dailyValorantInfoId: valorantInfo.id,
      },
      include: {
        ValorantInfoDaily: true,
      },
    })

    toResult.dailyStoreItems = await transformWeaponItems('DAILY', items)
  }

  // if (isEmptyArray(toResult.accessoryStoreItems)) {
  //   const items = AccessoryStore.AccessoryStoreOffers.map(
  //     (offer) => offer.Offer.Rewards[0].ItemID,
  //   )
  //   await prisma.storeList.create({
  //     data: {
  //       items,
  //       type: 'ACCESSORY',
  //       useAt: calcWeeklyTime(),
  //       dailyValorantInfoId: valorantInfo.id,
  //     },
  //     include: {
  //       ValorantInfoDaily: true,
  //     },
  //   })

  //   toResult.accessoryStoreItems = await transformWeaponItems(
  //     'ACCESSORY',
  //     items,
  //   )
  // }

  return response(toResult)
})
