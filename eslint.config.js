import { sxzz } from '@sxzz/eslint-config'

export default sxzz(
  [
    {
      ignores: ['packages/server/.nitro'],
    },
    {
      files: ['packages/server/{routes,plugins,middlewares}/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  {
    vue: true,
    prettier: true,
    markdown: true,
    unocss: true,
    sortKeys: true,
  },
)
