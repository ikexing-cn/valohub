import {
  type ValorantApiClient,
  createValorantApiClient,
  provideAuthViaTokens,
  provideClientVersionViaAuthApi,
  provideClientVersionViaVAPI,
  provideRegion,
  useProviders,
} from '@tqman/valorant-api-client'

let vapic: ValorantApiClient

export async function useVapic() {
  if (!vapic) {
    vapic = await createValorantApiClient({
      auth: useProviders(provideClientVersionViaVAPI()),
    })

    // TODO: use redis cookie
    // eslint-disable-next-line unused-imports/no-unused-vars
    const _axiosInstance = vapic.auth.axiosInstance
    // axiosInstance.interceptors.request.use()
    // axiosInstance.interceptors.response.use()
  }
  return vapic
}

export interface Tokens {
  idToken: string
  accessToken: string
  entitlementsToken: string
}
export async function updateVapic({
  tokens,
  region,
  shard,
}: {
  tokens: Tokens
  region: string
  shard: string
}) {
  const vapic = await useVapic()
  await vapic.reinitializeWithProviders({
    remote: useProviders([
      provideClientVersionViaAuthApi(),
      provideRegion(region, shard),
      provideAuthViaTokens(tokens.accessToken, tokens.entitlementsToken),
    ]),
  })
}
