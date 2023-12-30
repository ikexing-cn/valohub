import type { IsNull } from '..'

export interface IResponse<
  Data = undefined,
  Message = Data extends IsNull<Data> ? string : string | undefined,
> {
  success: boolean
  message: Message
  data: Data
}

export type AccountVerifyResponse = IResponse<{
  needInit?: boolean
  needBind?: boolean
}>

// ===== with middleware =====

export type VerifiedResponseWith<T extends object = {}> = IResponse<
  AccountVerifyResponse['data'] & T
>

// =====

export type AccountBindResponse = VerifiedResponseWith<{
  needMFA: boolean
}>

export type InGameStoreFrontResponse = VerifiedResponseWith<{
  skinItems?: string[]
}>
