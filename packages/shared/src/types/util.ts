export type IsNull<T extends unknown | null | undefined> = T extends
  | null
  | undefined
  ? true
  : false

export type NotNull<T extends unknown | null | undefined> = T extends IsNull<T>
  ? never
  : T
