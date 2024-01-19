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
    needMFA: boolean
    needVerify: boolean
    needRetry: boolean
    needReauth: boolean
  }>
>

// ===== with middleware =====

export type VerifiedResponseWith<T extends object = {}> = IResponse<
  AccountVerifyResponse['data'] & Partial<T>
>

// =====

export type AccountBindResponse = VerifiedResponseWith<{
  isBinded: boolean
}>

export type InGameStoreFrontResponse = VerifiedResponseWith<{
  tagLine: string
  gameName: string

  items: {
    uuid: string
    cost: number
    costType: string
  }[]
}>
