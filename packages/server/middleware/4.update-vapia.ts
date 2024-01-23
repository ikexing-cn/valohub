import type { Tokens } from '../utils/vapic'

export default defineEventHandler(async (event) => {
  const valorantInfo = event.context.valorantInfo

  if (valorantInfo && !getRequestURL(event).pathname.startsWith('/account')) {
    await updateVapic({
      shard: valorantInfo.shard,
      region: valorantInfo.region,
      tokens: valorantInfo.tokens as unknown as Tokens,
    })
  }
})
