export default defineEventHandler((event) => {
  if (event.context.account && event.context.valorantInfo) {
    return useResponse()('验证成功')
  }
})
