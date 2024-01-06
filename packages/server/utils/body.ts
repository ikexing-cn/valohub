import type { ZodSchema } from 'zod'

export function useValidatedBody<T = object>(schema: ZodSchema<T>) {
  return readValidatedBody(useEvent(), (body) => {
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0].message, {
        cause: parsed.error.errors[0].code,
      })
    }
    return parsed.data
  })
}
