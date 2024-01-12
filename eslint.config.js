import { sxzz } from '@sxzz/eslint-config'

export default sxzz(
  [
    {
      ignores: ['packages/server/.nitro'],
    },
    {
      files: [
        'packages/website/**/**/*.tsx',
        'packages/server/{routes,plugins,middleware}/**/*.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  {
    unocss: false,
    vue: true,
    prettier: true,
    markdown: true,
    sortKeys: true,
  },
)
