export default defineEventHandler(async (event) => {
  if (!['/api/auth/register', '/api/auth/login'].includes(event.path))
    return
  const body = await readBody<{ token: string }>(event)
  if (!body?.token)
    throw createError({ status: 400, message: '请先验证！' })

  const { reCaptchaSecret } = useRuntimeConfig()
  const reCaptchaResponse = await $fetch<{
    action: string
    success: boolean
  }>('https://recaptcha.net/recaptcha/api/siteverify', {
    method: 'POST',
    params: {
      response: body.token,
      secret: reCaptchaSecret,
    },
  })

  if (!reCaptchaResponse.success || event.path.split('/').pop()! !== reCaptchaResponse.action)
    throw createError({ status: 400, message: '请先验证！' })
})
