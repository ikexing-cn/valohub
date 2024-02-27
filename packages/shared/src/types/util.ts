import { type ZodSchema, z } from 'zod'
import type { EventHandlerRequest, EventHandlerResponse } from 'h3'
import { calculateMd5 } from '../utils/crypto'

export interface GenerateTypeDefinitions<
  Request extends ZodSchema<EventHandlerRequest>,
  Response = any,
> {
  request: Request['_type']
  response: MaybePromise<Response>
}

export type ExtractRequest<T extends { request: EventHandlerRequest }> = T['request']
export type ExtractResponse<T extends { response: EventHandlerResponse }> = T['response']

export type ExtractRequestBody<T extends { request: EventHandlerRequest }> = ExtractRequest<T>['body']
export type ExtractRequestQuery<T extends { request: EventHandlerRequest }> = ExtractRequest<T>['query']
export type ExtractRequestRouterParams<T extends { request: EventHandlerRequest }> = ExtractRequest<T>['routerParams']

export type MaybePromise<T> = T | Promise<T>

// ==============================================================================

export const emptyParser = z.literal(undefined)
export const passwordParser = z.string({ required_error: '密码不可为空' })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.,?]).{8,}$/, '密码必须包含大小写字母、数字和特殊符号, 且长度必须大于6')
  .trim()
  .transform(v => calculateMd5(v))
