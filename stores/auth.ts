import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth-store', () => {
  const token = ref<string>('')

  return {
    token,
  }
}, { persist: true })
