//https://nitro.unjs.io/config
export default defineNitroConfig({
  experimental: {
    asyncContext: true,
  },
  preset: 'zeabur',
  externals: {
    inline: ['fp-ts', 'fp-ts/TaskEither'],
  },
})
