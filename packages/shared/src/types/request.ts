import { z } from 'zod'

const qq = z
  .string({
    required_error: 'QQ号不能为空',
  })
  .regex(/[1-9]\d{4,10}/, {
    message: 'QQ号格式不正确',
  })
  .min(5, {
    message: 'QQ号长度必须大于5',
  })

const alias = z
  .string({
    invalid_type_error: '别名必须是字符串',
  })
  .trim()
  .default('default')

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

export type AccountVerifyRequest = typeof accountSchema._input

export const bindSchema = z.object({
  alias,
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
    .string()
    .trim()
    .regex(/^\d{6}$/, {
      message: '验证码必须是6位数字',
    })
    .optional(),
  remember: z
    .boolean({
      invalid_type_error: '记住密码必须是布尔值',
    })
    .optional(),
})

export type AccountBindSchema = typeof bindSchema._input

export const selectValoInfoSchema = z.object({ alias })

export type InGameStoreFrontSchema = typeof selectValoInfoSchema._input
