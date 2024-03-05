import type { Prisma } from '@prisma/client'

type UserDetails = Omit<Prisma.$AccountPayload['scalars'], 'password' | 'createdAt' | 'updatedAt' | 'id'>

export const useAuthStore = defineStore('auth-store', () => {
  const token = ref<string>('')
  const details = ref<UserDetails>()

  return {
    token,
    details,
  }
}, { persist: true })
