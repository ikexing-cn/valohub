export enum StoreCostType {
  RP = 'e59aa87c-4cbf-517a-5983-6e81511be9b7',
  VP = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741',
  KC = '85ca954a-41f2-ce94-9b45-8ca3dd39a00d', // Kingdom Credits
}

export type StoreCost<T extends StoreCostType> = {
  [P in T]: number
}

export interface StoreFrontResponse {
  FeaturedBundle: FeaturedBundle
  SkinsPanelLayout: SkinsPanelLayout
  UpgradeCurrencyStore: UpgradeCurrencyStore
  BonusStore: BonusStore
  AccessoryStore: AccessoryStore
}

export interface SingleItemStoreOfferElement {
  OfferID: string
  IsDirectPurchase: boolean
  StartDate: Date
  Cost: StoreCost<StoreCostType.VP>
  Rewards: Reward[]
}

export interface AccessoryStoreOffer {
  Offer: Offer
  ContractID: string
}

export interface Offer {
  OfferID: string
  IsDirectPurchase: boolean
  StartDate: Date
  Cost: StoreCost<StoreCostType.KC>
  Rewards: Reward[]
}

export interface FeaturedBundle {
  Bundle: Bundle
  Bundles: Bundle[]
  BundleRemainingDurationInSeconds: number
}

export interface Bundle {
  ID: string
  DataAssetID: string
  CurrencyID: string
  Items: ItemElement[]
  ItemOffers: ItemOffer[]
  TotalBaseCost: StoreCost<StoreCostType.VP>
  TotalDiscountedCost: StoreCost<StoreCostType.VP>
  TotalDiscountPercent: number
  DurationRemainingInSeconds: number
  WholesaleOnly: boolean
}

export interface ItemElement {
  Item: ItemItem
  BasePrice: number
  CurrencyID: string
  DiscountPercent: number
  DiscountedPrice: number
  IsPromoItem: boolean
}

export interface ItemItem {
  ItemTypeID: string
  ItemID: string
  Amount: number
}

export interface ItemOffer {
  BundleItemOfferID: string
  Offer: SingleItemStoreOfferElement
  DiscountPercent: number
  DiscountedCost: StoreCost<StoreCostType.VP>
}

export interface Reward {
  ItemTypeID: string
  ItemID: string
  Quantity: number
}

export interface SkinsPanelLayout {
  SingleItemOffers: string[]
  SingleItemStoreOffers: SingleItemStoreOfferElement[]
  SingleItemOffersRemainingDurationInSeconds: number
}

export interface UpgradeCurrencyStore {
  UpgradeCurrencyOffers: UpgradeCurrencyOffer[]
}

export interface UpgradeCurrencyOffer {
  OfferID: string
  StorefrontItemID: string
  Offer: SingleItemStoreOfferElement
  DiscountedPercent: number
}

export interface BonusStore {
  BonusStoreOffers: BonusStoreOffer[]
  BonusStoreRemainingDurationInSeconds: number
  BonusStoreSecondsSinceItStarted: number
}

export interface BonusStoreOffer {
  BonusOfferID: string
  Offer: SingleItemStoreOfferElement
  DiscountPercent: number
  DiscountCosts: StoreCost<StoreCostType.VP>
  IsSeen: boolean
}

export interface AccessoryStore {
  AccessoryStoreOffers: AccessoryStoreOffer[]
  AccessoryStoreRemainingDurationInSeconds: number
  StorefrontID: string
}
