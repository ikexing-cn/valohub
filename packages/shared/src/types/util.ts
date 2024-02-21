import { type ZodSchema, z } from 'zod'
import type { EventHandlerRequest } from 'h3'
import { calculateMd5 } from '../utils/crypto'

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
export type ResponseReturned<T = unknown> = AtLeastOne<{ data: T, message: string }>
export type StatusResponse<Status extends number = number> = { 200: ResponseReturned } & GlobalStatusResponse & { [
  Key in Exclude<Status, keyof GlobalStatusResponse>]: ResponseReturned
}

export interface GlobalStatusResponse {
  401: { message: string }
  500: { message: string }
}

export interface GenerateTypeDefinitions<
  Request extends ZodSchema<EventHandlerRequest>,
  Response extends ZodSchema<Omit<StatusResponse, keyof GlobalStatusResponse>>,
> {
  request: Request['_type']
  response: Response['_type'] & GlobalStatusResponse
}

export type ExtractRequest<T extends { request: EventHandlerRequest }> = T['request']

export type ExtractRequestBody<T extends { request: EventHandlerRequest }> = ExtractRequest<T>['body']
export type ExtractRequestQuery<T extends { request: EventHandlerRequest }> = ExtractRequest<T>['query']
export type ExtractRequestRouterParams<T extends { request: EventHandlerRequest }> = ExtractRequest<T>['routerParams']

// ==============================================================================

export const emptyParser = z.literal(undefined)
export const passwordParser = z.string({ required_error: '密码不可为空' })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.,?]).{8,}$/, '密码必须包含大小写字母、数字和特殊符号, 且长度必须大于6')
  .trim()
  .transform(v => calculateMd5(v))
