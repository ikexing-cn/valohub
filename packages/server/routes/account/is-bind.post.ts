export default defineEventHandler((event) => {
  const response = useResponse()

  if (event.context.valorantInfo) {
    return response('已绑定')
  } else {
    return response(false, '未绑定', {
      needBind: true,
    })
  }
})
