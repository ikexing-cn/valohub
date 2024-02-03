import { antfu, unocss } from '@antfu/eslint-config'

export default antfu(
  {
    toml: false,
    yaml: false,
    jsonc: false,
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
  {
    files: ['packages/website/src/**/*.tsx'],
    plugins: {
      unocss: unocss({
        strict: true,
      }),
    },
  },
)
