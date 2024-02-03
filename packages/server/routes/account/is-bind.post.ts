export default defineEventHandler((event) => {
  const response = useResponse()

  if (event.context.valorantInfo) {
    return response(true, '已绑定', {
      needBind: false,
    })
  }
  else {
    return response(false, '未绑定', {
      needBind: true,
    })
  }
})
