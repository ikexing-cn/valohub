import type { ZodSchema } from 'zod'
import type { EventHandler, EventHandlerRequest, H3Event, InferEventInput } from 'h3'
import type { ExtractRequest, ResponseReturned, StatusResponse } from '@valorant-bot/shared'

declare module 'h3' {
  interface H3EventContext {
    body: Record<string, any> | undefined
    query: Record<string, any> | undefined
    routerParams: Record<string, any> | undefined
  }
}

export function defineTypeSafeEvent<T extends { request: EventHandlerRequest }>(
  requestSchema: ZodSchema<ExtractRequest<T>>,
  handler: EventHandler<ExtractRequest<T>, ResponseReturned | Promise<ResponseReturned>>,
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
  return defineEventHandler<ExtractRequest<T>, ResponseReturned | Promise<ResponseReturned>>(async (event) => {
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

export function readTypeSafeBody<T, Event extends H3Event = H3Event, _T = InferEventInput<'body', Event, T>>(event: Event) {
  return event.context.body as _T
}

type ExtractData<T> = 'data' extends keyof T ? T['data'] : never
type ExtractMessage<T> = 'message' extends keyof T ? string : never

export function createTypeSafeResponse<T extends StatusResponse>(event: H3Event) {
  function throwOrReturn(status: number, data: ResponseReturned) {
    if (status >= 200 && status <= 299) {
      return data
    }
    else {
      throw createError({
        data,
        status,
        statusMessage: data.message,
      })
    }
  }

  function data<Status extends keyof T>(status: Status, data: ExtractData<T[Status]>) {
    setResponseStatus(event, Number(status))
    return throwOrReturn(Number(status), { data })
  }

  function message<Status extends keyof T>(status: Status, message: ExtractMessage<T[Status]>) {
    setResponseStatus(event, Number(status))
    return throwOrReturn(Number(status), { message })
  }

  function messageWithData<Status extends keyof T>(status: Status, message: string, data: ExtractData<T[Status]>) {
    setResponseStatus(event, Number(status))
    return throwOrReturn(Number(status), { message, data })
  }

  return {
    data,
    message,
    messageWithData,
  }
}
