import { z } from 'zod'

import { passwordParser } from '../util'
import type { GenerateTypeDefinitions } from '../util'

export const registerRequest = z.object({
  body: z.object({
    password: passwordParser,
    rePassword: passwordParser,
    username: z.string({ required_error: '用户名不可为空' }).trim(),
    email: z.string({ required_error: '邮箱不可为空' }).email({ message: '邮箱格式不正确' }).trim(),
  }).refine(data => data.password === data.rePassword, { message: '两次密码不一致' }),
})

export type RegisterResponse = string
export type RegisterTypeDefinitions = GenerateTypeDefinitions<typeof registerRequest, RegisterResponse>
