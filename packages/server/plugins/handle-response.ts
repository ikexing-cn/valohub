function createResponse<
  Status extends number,
  Result = Status extends 200 ? object | string : Error,
>(status: Status, errorOrBody: Result) {
  const result =
    status !== 200
      ? { type: 'Error', message: (errorOrBody as Error).message }
      : typeof errorOrBody === 'string'
        ? { type: 'Message', message: errorOrBody }
        : errorOrBody

  return new Response(
    JSON.stringify({
      success: status === 200,
      ...result,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error, { event }) => {
    console.error(error)
    event?.respondWith(createResponse(500, error))
  })

  nitro.hooks.hook('beforeResponse', (event, { body }) => {
    event?.respondWith(createResponse(200, body))
  })
})
