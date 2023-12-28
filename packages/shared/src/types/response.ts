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
