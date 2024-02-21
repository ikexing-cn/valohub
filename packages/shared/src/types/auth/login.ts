import { z } from 'zod'

import { passwordParser } from '../util'
import type { GenerateTypeDefinitions } from '../util'

export const loginRequest = z.object({
  body: z.object({
    password: passwordParser,
    username: z.string({ required_error: '用户名不可为空' }).trim(),
  }),
})
export const loginResponse = z.object({
  200: z.object({
    data: z.string(),
  }),
})

export type LoginTypeDefinitions = GenerateTypeDefinitions<typeof loginRequest, typeof loginResponse>
