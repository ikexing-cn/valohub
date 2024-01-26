import type { Tokens } from '../utils/vapic'

export default defineEventHandler(async (event) => {
  const isReauth = event.context.reauth
  const valorantInfo = event.context.valorantInfo

  if (
    valorantInfo &&
    !isReauth &&
    !getRequestURL(event).pathname.startsWith('/account')
  ) {
    await updateVapic({
      qq: valorantInfo.accountQQ,
      alias: valorantInfo.alias,
      shard: valorantInfo.shard,
      region: valorantInfo.region,
      tokens: valorantInfo.tokens as unknown as Tokens,
    })
  }
})
