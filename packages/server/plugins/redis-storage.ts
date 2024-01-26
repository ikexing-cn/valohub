import redisStorage from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  const driver = redisStorage({
    base: 'redis',
    url: process.env.REDIS_URI,
    ttl: 60 * 60 * 1, // 1 hour
  })

  storage.mount('redis', driver)
})
