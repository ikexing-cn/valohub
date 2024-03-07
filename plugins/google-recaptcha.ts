import { VueReCaptcha } from 'vue-recaptcha-v3'

export default defineNuxtPlugin((nuxtApp) => {
  const { public: { clientReCaptchaSecret } } = useRuntimeConfig()

  nuxtApp.vueApp.use(VueReCaptcha, {
    siteKey: clientReCaptchaSecret,
    loaderOptions: {
      autoHideBadge: true,
      customUrl: '//recaptcha.net/recaptcha/api.js',
    },
  })
})
