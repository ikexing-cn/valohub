import { VueReCaptcha } from 'vue-recaptcha-v3'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueReCaptcha, {
    siteKey: '6LdgbIopAAAAABpGIO_vheaw6AMNhcflLl6EjJe0',
    loaderOptions: {
      autoHideBadge: true,
      customUrl: '//recaptcha.net/recaptcha/api.js',
    },
  })
})
