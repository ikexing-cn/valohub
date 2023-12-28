export type NotNull<T extends unknown | null | undefined> = T extends
  | null
  | undefined
  ? never
  : T

export type IsNull<T extends unknown | null | undefined> = T extends
  | null
  | undefined
  ? true
  : false
