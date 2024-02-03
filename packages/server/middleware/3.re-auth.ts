import {
  provideClientVersionViaAuthApi,
  provideRegion,
  useProviders,
} from '@tqman/valorant-api-client'
import type { Prisma } from '@valorant-bot/server-database'

declare module 'h3' {
  interface H3EventContext {
    reauth: boolean
  }
}

const skipPaths = ['/account/verify', '/storage']

export default defineEventHandler(async (event) => {
  const valorantInfo = event.context.valorantInfo

  if (valorantInfo && valorantInfo.updatedAt.getTime() + 1000 * 60 * 30 < Date.now()) {
    const prisma = usePrisma()

    const vapic = await useVapic(valorantInfo.accountQQ, valorantInfo.alias)
    const pathname = getRequestURL(event).pathname

    if (!skipPaths.some(path => pathname.startsWith(path))) {
      await vapic.reinitializeWithProviders({
        remote: useProviders([
          provideClientVersionViaAuthApi(),
          provideRegion(
            valorantInfo.region.toLowerCase(),
            valorantInfo.shard.toLowerCase(),
          ),
          provideReauth({
            password: valorantInfo.remember
              ? decrypt(JSON.parse(valorantInfo.riotPassword))
              : valorantInfo.riotPassword,
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

      event.context.reauth = true
    }
  }
})
