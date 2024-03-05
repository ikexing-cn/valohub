export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],
  ui: {
    icons: ['carbon'],
  },
  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
  runtimeConfig: {
    // postgresUri: '',
    jwtSecret: '',
    extraMd5Str: '',
    reCaptchaSecret: '',
  },
  css: [
    'vue-toastification/dist/index.css',
  ],
  build: {
    transpile: ['vue-toastification'],
  },
})
