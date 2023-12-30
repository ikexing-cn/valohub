import type { ParsedRSOAuthResult } from '../types'

const BASE_DOMAIN = 'https://{endPoint}.{server}.a.pvp.net'

function genInGameApi(endPoint: string, server: string, restUrl: string) {
  return (
    BASE_DOMAIN.replace('{endPoint}', endPoint).replace('{server}', server) +
    restUrl
  )
}

export function replacePlaceholder(url: string, ...values: string[]) {
  let index = 0
  return url.replaceAll(/{(.+?)}/g, () => {
    if (index >= values.length) {
      throw new RangeError(
        'Placeholder values are less than the total placeholders!',
      )
    }
    return values[index++]
  })
}

export enum ItemType {
  Agents = '01bb38e1-da47-4e6a-9b3d-945fe4655707', // 角色
  Contracts = 'f85cb6f7-33e5-4dc8-b609-ec7212301948', // 合约
  Sprays = 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475', // 喷漆
  GunBuddies = 'dd3bf334-87f3-40bd-b043-682a57a8dc3a', // 挂件
  PlayerCards = '3f296c07-64c3-494c-923b-fe692a4fa1bd', // 卡面
  Skins = 'e7c63390-eda7-46e0-bb7a-a6abdacd2433', // 皮肤
  SkinsChroma = '3ad1b2b2-acdb-4524-852f-954a76ddae0a', // 皮肤换色?
  PlayerTitles = 'de7caa6b-adf7-4588-bbd1-143831e786c6', // 称号
}

export function createInGameApi(server: string) {
  return {
    // 获取合约、任务列表及进度
    getContracts: (userId: string) =>
      replacePlaceholder(
        genInGameApi('pd', server, '/contracts/v1/contracts/{userId}'),
        userId,
      ),

    // 获取游戏内的物品信息及其ID
    getContent: () => genInGameApi('pd', server, '/content-service/v3/content'),

    // 获取账户等级、经验
    getAccountXP: (userId: string) =>
      replacePlaceholder(
        genInGameApi('pd', server, '/account-xp/v1/players/{userId}'),
        userId,
      ),

    // 获取玩家的汇总信息
    getMMR: (userId: string) =>
      replacePlaceholder(
        genInGameApi('pd', server, '/mmr/v1/players/{userId}'),
        userId,
      ),

    // 获取玩家当前的装备信息
    getPlayerLoadout: (userId: string) =>
      replacePlaceholder(
        genInGameApi(
          'pd',
          server,
          '/personalization/v2/players/{userId}/playerloadout',
        ),
        userId,
      ),

    // 获取商城中所有的物品
    getStoreOffers: () => genInGameApi('pd', server, '/store/v1/offers'),

    // 获取商城中当前出售的物品
    getStoreFront: (userId: string) =>
      replacePlaceholder(
        genInGameApi('pd', server, '/store/v2/storefront/{userId}'),
        userId,
      ),

    // 获取玩家的VP点数、RP点数
    // 85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741: VP
    // e59aa87c-4cbf-517a-5983-6e81511be9b7: RP
    getStoreWallet: (userId: string) =>
      replacePlaceholder(
        genInGameApi('pd', server, '/store/v1/wallet/{userId}'),
        userId,
      ),

    // 获取商店订单信息（orderID可以在创建订单时获取）
    getStoreOrder: (orderId: string) =>
      replacePlaceholder(
        genInGameApi('pd', server, '/store/v1/order/{orderId}'),
        orderId,
      ),

    // 获取玩家已拥有的物品
    getStoreEntitlements: (userId: string, itemType: ItemType) =>
      replacePlaceholder(
        genInGameApi(
          'pd',
          server,
          '/store/v1/entitlements/{userId}/{itemType}',
        ),
        userId,
        itemType,
      ),
  } as const
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InGameRequestHeader {
  public static riotClientVersion = 'release-07.12-shipping-15-2164217'
  public static riotClientPlatform =
    'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9'
}

export function getInGameRequestHeader(
  entitlementsToken: string,
  authResult: ParsedRSOAuthResult,
) {
  return {
    'X-Riot-ClientVersion': InGameRequestHeader.riotClientVersion,
    'X-Riot-ClientPlatform': InGameRequestHeader.riotClientPlatform,
    'X-Riot-Entitlements-JWT': entitlementsToken,
    Authorization: `${authResult.tokenType} ${authResult.accessToken}`,
  }
}
