import { defineI18nMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/h3'

import en from '../locales/en'
import zh from '../locales/zh'

declare module '@intlify/h3' {
  export interface DefineLocaleMessage extends ResourceSchema {}
}

export default defineNitroPlugin((nitro) => {
  const { onRequest, onAfterResponse } = defineI18nMiddleware<[ResourceSchema], 'en' | 'zh'>({
    locale: detectLocaleFromAcceptLanguageHeader,
    messages: {
      en,
      zh,
    },
  })

  nitro.hooks.hook('request', onRequest)
  nitro.hooks.hook('afterResponse', onAfterResponse)
})
