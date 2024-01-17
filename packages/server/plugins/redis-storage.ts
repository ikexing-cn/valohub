import redisStorage from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  const driver = redisStorage({
    base: 'redis',
    url: process.env.REDIS_URI,
    ttl: 120,
  })

  storage.mount('redis', driver)
})
