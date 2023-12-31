import {
  type InGameApiResponse,
  createInGameApi,
  getInGameRequestHeader,
} from '@valorant-bot/core'
import type { Prisma } from '@prisma/client'

type InGameApis = ReturnType<typeof createInGameApi>

export function useInGame<Api extends keyof InGameApis>(
  valorantInfo: Prisma.$ValorantInfoPayload['scalars'],
  api: Api,
  ...params: Parameters<InGameApis[Api]> extends unknown[]
    ? Parameters<InGameApis[Api]>
    : never
) {
  const headers = getInGameRequestHeader(
    valorantInfo.entitlementsToken,
    JSON.parse(valorantInfo.parsedAuthResult as string),
  )

  const { request } = useRequest()
  const inGameApi = createInGameApi(valorantInfo.region.toLowerCase())
  const apiUrl = (inGameApi[api] as any)(...params) as string

  return request<InGameApiResponse[Api]>(apiUrl, { headers })
}
