import { z } from 'zod'

const qq = z
  .number({
    required_error: 'QQ号不能为空',
    invalid_type_error: 'QQ号必须是数字',
  })
  .min(5, {
    message: 'QQ号长度必须大于5',
  })

export const accountSchema = z.object({
  qq,
  verifyPassword: z
    .string({
      invalid_type_error: '密码必须是字符串',
    })
    .min(6, {
      message: '密码长度必须大于6',
    })
    .trim()
    .optional(),
})

export type AccountVerifyRequest = typeof accountSchema._type

export const bindSchema = z.object({
  qq,
  username: z
    .string({
      required_error: 'Riot用户名不能为空',
      invalid_type_error: 'Riot用户名必须是字符串',
    })
    .trim(),
  password: z
    .string({
      required_error: 'Riot密码不能为空',
      invalid_type_error: 'Riot密码必须是字符串',
    })
    .trim(),
  mfaCode: z
    .number({
      invalid_type_error: '验证码必须是数字',
    })
    .optional(),
  remember: z
    .boolean({
      invalid_type_error: '记住密码必须是布尔值',
    })
    .optional(),
})

export type AccountBindSchema = typeof bindSchema._type
