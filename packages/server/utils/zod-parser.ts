import type { ZodSchema } from 'zod'

export function zodParse<T = object>(schema: ZodSchema<T>, obj: object) {
  const parsed = schema.safeParse(obj)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message, {
      cause: parsed.error.errors[0].code,
    })
  }
  return parsed.data
}
