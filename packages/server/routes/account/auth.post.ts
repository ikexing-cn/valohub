export default defineEventHandler((event) => {
  if (event.context.account) {
    return useResponse()('验证成功')
  }
})
