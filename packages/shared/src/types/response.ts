export interface IResponse<Data extends object> {
  data: Data
  success: boolean
  message: string
}

export type AccountVerifyResponse = IResponse<
  Partial<{
    needInit: boolean
    needBind: boolean
    needVerify: boolean
  }>
>

// ===== with middleware =====

export type VerifiedResponseWith<T extends object = {}> = IResponse<
  AccountVerifyResponse['data'] & Partial<T>
>

// =====

export type AccountBindResponse = VerifiedResponseWith<{
  needMFA: boolean
  isBinded: boolean
}>

export type InGameStoreFrontResponse = VerifiedResponseWith<{
  skinItems: {
    uuid: string
    cost: number
    costType: string
  }[]
}>
