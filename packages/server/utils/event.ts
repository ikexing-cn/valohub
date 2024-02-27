import type { ZodSchema } from 'zod'
import type { EventHandler, EventHandlerRequest, EventHandlerResponse, H3Event, InferEventInput } from 'h3'
import type { ExtractRequest, ExtractResponse } from '@valorant-bot/shared'

declare module 'h3' {
  interface H3EventContext {
    body: Record<string, any> | undefined
    query: Record<string, any> | undefined
    routerParams: Record<string, any> | undefined
  }
}

export function readTypeSafeBody<T, Event extends H3Event = H3Event, _T = InferEventInput<'body', Event, T>>(event: Event) {
  return event.context.body as _T
}

export function defineTypeSafeEvent<T extends {
  request: EventHandlerRequest
  response: EventHandlerResponse
}>(
  requestSchema: ZodSchema<ExtractRequest<T>>,
  handler: EventHandler<ExtractRequest<T>, ExtractResponse<T>>,
  options: {
    parsedBody: boolean
    parsedQuery: boolean
    parsedRouterParams: boolean
  } = {
    parsedBody: true,
    parsedQuery: false,
    parsedRouterParams: false,
  },
) {
  return defineEventHandler<ExtractRequest<T>, ExtractResponse<T>>(async (event) => {
    const { parsedBody, parsedQuery, parsedRouterParams } = options
    if (parsedBody) {
      const validatedBody = await readValidatedBody(event, body => requestSchema.parse({ body }))
      event.context.body = validatedBody.body
    }

    if (parsedQuery) {
      const validatedQuery = await getValidatedQuery(event, query => requestSchema.parse({ query }))
      event.context.query = validatedQuery.query
    }

    if (parsedRouterParams) {
      const validatedRouterParams = await getValidatedRouterParams(event, params => requestSchema.parse({ params }))
      event.context.routerParams = validatedRouterParams.routerParams
    }

    return handler(event)
  })
}
