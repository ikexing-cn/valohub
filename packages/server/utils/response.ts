import type { AccountVerifyResponse, IResponse } from '@valorant-bot/shared'

export function getResponse<T extends object>(
  dataOrMessage: T | string,
): IResponse<T>
export function getResponse<T extends object>(
  isSuccess: boolean,
  dataOrMessage: T | string,
): IResponse<T>
export function getResponse<T extends object>(
  isSuccess: boolean,
  message: string,
  data: T,
): IResponse<T>
export function getResponse<T extends object>(
  paramA: boolean | string | T,
  paramB?: string | T,
  paramData?: T,
): IResponse<T | undefined> {
  let success: boolean
  let message: string | undefined
  let data: T | undefined

  if (paramData) {
    return {
      success: paramA as boolean,
      message: paramB as string,
      data: paramData,
    }
  }

  if (typeof paramA === 'boolean') {
    success = paramA

    if (typeof paramB === 'string') {
      message = paramB
    } else {
      data = paramB as T
    }
  } else {
    success = true
    if (typeof paramA === 'string') {
      message = paramA
    } else {
      data = paramA
    }
  }

  return { success, message, data }
}

export const useResponse = <
  T extends object = AccountVerifyResponse['data'],
>() => getResponse<T>
