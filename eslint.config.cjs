const { antfu } = require('@antfu/eslint-config')

module.exports = antfu(
  {
    formatters: {
      markdown: 'prettier',
    },
  },
)
