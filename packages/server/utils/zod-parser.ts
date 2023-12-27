import type { ZodSchema } from 'zod'

export function zodParse(schema: ZodSchema<any>, obj: object) {
  const parsed = schema.safeParse(obj)
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message)
  }
}
