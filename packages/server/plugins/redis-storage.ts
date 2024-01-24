import redisStorage from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  const driver = redisStorage({
    base: 'redis',
    url: process.env.REDIS_URI,
    ttl: -1, // never expire
  })

  storage.mount('redis', driver)
})
