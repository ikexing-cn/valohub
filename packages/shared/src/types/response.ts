import type { UnArray } from './util'
import type { Weapons } from '@tqman/valoffi-api-client'
export interface IResponse<Data extends object> {
  data: Data
  success: boolean
  message: string

  cause?: string
  stack?: string
}

export type AccountVerifyResponse = IResponse<
  Partial<{
    needInit: boolean
    needBind: boolean
    needVerify: boolean

    needMFA: boolean
    needRetry: boolean
    needReauth: boolean
    riotUsername: string
  }>
>

// ===== with middleware =====

export type VerifiedResponseWith<T extends object = {}> = IResponse<
  AccountVerifyResponse['data'] & Partial<T>
>

// =====
export type CostType = 'VP' | 'RP' | 'KC'

export type AccountBindResponse = VerifiedResponseWith<{
  isBinded: boolean
}>

export type TCategory = Omit<
  UnArray<Weapons>,
  'skins' | 'weaponStats' | 'shopData'
>
export type TWeapon = UnArray<UnArray<UnArray<Weapons>['skins']>['levels']>

export interface ResponseStoreItem {
  cost: number
  costType: String
  category: TCategory
  weaponInfo: TWeapon
  discountPercent?: number
}

export type InGameStoreFrontResponse = VerifiedResponseWith<{
  tagLine: string
  gameName: string

  dailyStoreItems: ResponseStoreItem[]
  accessoryStoreItems: ResponseStoreItem[]
}>
