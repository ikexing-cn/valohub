import { defineConfig, presetAttributify, presetUno } from 'unocss'
import presetAnimations from 'unocss-preset-animations'
import { presetShadcn } from 'unocss-preset-shadcn'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetAnimations(),
    presetShadcn({ color: 'neutral' }),
  ],
  content: {
    pipeline: {
      include: [/\.([jt]s|[jt]sx)($|\?)/],
    },
  },
})
