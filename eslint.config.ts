import { antfu, unocss } from '@antfu/eslint-config'

export default antfu(
  {
    toml: false,
    yaml: false,
    jsonc: false,
    typescript: {
      tsconfigPath: 'tsconfig.json'
    },
    ignores: ['packages:/server/.nitro'],
    formatters: {
      markdown: 'prettier'
    }
  },
  {
    files: ['packages/website/src/**/*.tsx'],
    plugins: {
      unocss: unocss({
        strict: true
      })
    }
  }
)

// [
//   {
//     ignores: ['packages/server/.nitro'],
//   },
//   {
//     files: [
//       'packages/website/**/**/*.tsx',
//       'packages/server/{routes,plugins,middleware}/**/*.ts',
//     ],
//     rules: {
//       'import/no-default-export': 'off',
//     },
//   },
// ],
// {
//   unocss: false,
//   vue: true,
//   prettier: true,
//   markdown: true,
//   sortKeys: true,
// },
