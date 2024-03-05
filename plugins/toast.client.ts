import Toast from 'vue-toastification'

// import type { PluginOptions } from 'vue-toastification'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Toast)
})
