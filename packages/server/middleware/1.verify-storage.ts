import { storageSecretKeySchema } from '@valorant-bot/shared'

export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith('/storage')) {
    const { secretKey } = await useValidatedBody(storageSecretKeySchema)

    const realSecretKey = process.env.VALORANT_SERVER_STORAGE_SECRET_KEY!

    if (secretKey !== realSecretKey) {
      throw new Error('Secret key is not correct')
    }
  }
})
