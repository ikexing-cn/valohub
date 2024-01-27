import {
  provideAuthViaTokens,
  provideClientVersionViaAuthApi,
  provideRegion,
  useProviders,
} from '@tqman/valorant-api-client'

export interface Tokens {
  accessToken: string
  entitlementsToken: string
}
export default defineEventHandler(async (event) => {
  const isReauth = event.context.reauth
  const valorantInfo = event.context.valorantInfo

  if (
    valorantInfo &&
    !isReauth &&
    !getRequestURL(event).pathname.startsWith('/account')
  ) {
    const tokens = valorantInfo.tokens as unknown as Tokens
    const vapic = await useVapic(valorantInfo.accountQQ, valorantInfo.alias)
    await vapic.reinitializeWithProviders({
      remote: useProviders([
        provideClientVersionViaAuthApi(),
        provideRegion(
          valorantInfo.region.toLowerCase(),
          valorantInfo.shard.toLowerCase(),
        ),
        provideAuthViaTokens(tokens.accessToken, tokens.entitlementsToken),
      ]),
    })
  }
})
