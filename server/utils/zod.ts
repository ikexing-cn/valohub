import { createHash } from 'node:crypto'
import { z } from 'zod'

export function calculateMd5(content: string, pure: boolean = false) {
  const { extraMdtStr } = useRuntimeConfig()
  return createHash('md5').update(content).update(pure ? '' : extraMdtStr).digest('hex')
}

export const emptyParser = z.literal(undefined)
export const passwordParser = z.string({ required_error: '密码不可为空' })
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.,?]).{8,}$/, '密码必须包含大小写字母、数字和特殊符号, 且长度必须大于6')
  .trim()
  .transform(v => calculateMd5(v))
