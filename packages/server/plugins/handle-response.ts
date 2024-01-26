function createResponse<
  Status extends number,
  Result = Status extends 200 ? object | string : Error,
>(status: Status, errorOrBody: Result) {
  console.error(errorOrBody)

  const result =
    status !== 200
      ? {
          success: false,
          message:
            (errorOrBody as Error).message ?? '出现内部错误, 请联系开发者',
        }
      : errorOrBody

  return new Response(JSON.stringify(result), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error, { event }) => {
    if (!event?.path.includes('favicon.ico')) {
      console.error(error)
    }
    event?.respondWith(createResponse(500, error))
  })

  nitro.hooks.hook('beforeResponse', (event, { body }) => {
    event?.respondWith(createResponse(200, body))
  })
})
