import {
  provideClientVersionViaAuthApi,
  provideRegion,
  useProviders,
} from '@tqman/valorant-api-client'
import { defer, firstValueFrom, from, retry } from 'rxjs'
import type { Prisma } from '@valorant-bot/server-database'

// async function setTokens(
//   idToken: string,
//   accessToken: string,
//   authClient: AuthApiClient,
// ) {
//   const event = useEvent()
//   const prisma = usePrisma()
//   const valorantInfo = event.context.valorantInfo

//   const entitlementsToken = await getEntitlementsToken(authClient, accessToken)
//   const tokens = {
//     idToken,
//     accessToken,
//     entitlementsToken,
//   }

//   event.context.valorantInfo = await prisma.valorantInfo.update({
//     data: {
//       tokens: tokens as Prisma.JsonObject,
//     },
//     where: {
//       id: valorantInfo.id,
//     },
//   })
// }

export default defineEventHandler(async (event) => {
  const valorantInfo = event.context.valorantInfo

  if (
    valorantInfo &&
    valorantInfo.updatedAt.getTime() + 1000 * 60 * 30 < Date.now()
  ) {
    const prisma = usePrisma()

    const vapic = await useVapic(valorantInfo.accountQQ, valorantInfo.alias)

    if (!getRequestURL(event).pathname.startsWith('/account/verify')) {
      vapic.reinitializeWithProviders({
        remote: useProviders([
          provideClientVersionViaAuthApi(),
          provideRegion(
            valorantInfo.region.toLowerCase(),
            valorantInfo.shard.toLowerCase(),
          ),
          provideReauth({
            alias: valorantInfo.alias,
            qq: valorantInfo.accountQQ,
            password: valorantInfo.riotPassword,
            username: valorantInfo.riotUsername,
            remember: valorantInfo.remember,
          }),
        ]),
      })

      const { accessToken, entitlementsToken } = vapic.remote.options

      const tokens = {
        accessToken,
        entitlementsToken,
      }

      event.context.valorantInfo = await prisma.valorantInfo.update({
        data: {
          tokens: tokens as Prisma.JsonObject,
        },
        where: {
          id: valorantInfo.id,
        },
      })
    }
  }
})
