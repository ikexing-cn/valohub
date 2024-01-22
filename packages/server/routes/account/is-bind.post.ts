export default defineEventHandler((event) => {
  const response = useResponse()

  if (event.context.valorantInfo) {
    return response(false, '已绑定')
  } else {
    return response('未绑定')
  }
})
