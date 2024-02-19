import { antfu } from '@antfu/eslint-config'

export default antfu(
  {
    toml: false,
    yaml: false,
    jsonc: false,
    vue: false,
    unocss: false,
    ignores: ['packages/server/.nitro'],
    typescript: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', './packages/*/tsconfig.*'],
      },
    },
    formatters: {
      markdown: 'prettier',
    },
  },
)
