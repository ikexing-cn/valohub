import type { AccountVerifyResponse } from '@valorant-bot/shared'

export class DataWithError<
  T extends AccountVerifyResponse['data'],
> extends Error {
  constructor(
    message: string,
    public data: T,
  ) {
    super(message)
    this.cause = data
    this.name = 'DataWithError'
  }
}
