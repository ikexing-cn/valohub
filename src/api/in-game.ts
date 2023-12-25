const BASE_DOMAIN = 'https://{endPoint}.{server}.a.pvp.net'

function genInGameApi(endPoint: string, server: string, restUrl: string) {
  return (
    BASE_DOMAIN.replace('{endPoint}', endPoint).replace('{server}', server) +
    restUrl
  )
}

export type InGameApiInstance = ReturnType<typeof createInGameApi>

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

export function createInGameApi(server: string) {
  return {
    StoreFront: genInGameApi('pd', server, '/store/v2/storefront/{userId}'),
  } as const
}
