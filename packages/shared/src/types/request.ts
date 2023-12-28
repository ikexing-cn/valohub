import { z } from 'zod'

export const accountSchema = z.object({
  qq: z
    .number({
      required_error: 'QQ号不能为空',
      invalid_type_error: 'QQ号必须是数字',
    })
    .min(5, {
      message: 'QQ号长度必须大于5',
    }),
  password: z
    .string({
      required_error: '密码不能为空',
      invalid_type_error: '密码必须是字符串',
    })
    .min(6, {
      message: '密码长度必须大于6',
    })
    .trim()
    .optional(),
})

export type AccountVerifyRequest = typeof accountSchema._type
