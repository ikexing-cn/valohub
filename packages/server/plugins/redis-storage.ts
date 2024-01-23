import redisStorage from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  const driver = redisStorage({
    base: 'redis',
    url: process.env.REDIS_URI,
    ttl: 60 * 60 * 24 * 30, // 30 days
  })

  storage.mount('redis', driver)
})
