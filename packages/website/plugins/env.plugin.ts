import { env } from 'node:process'
import type { Plugin } from 'vite'

export function EnvReplacePlugin(): Plugin {
  return {
    name: 'env-replace',
    enforce: 'pre',
    transform(code) {
      if (code.includes('import.meta.env')) {
        const replacements = Object.keys(env).reduce(
          (acc, key) => {
            acc[`import.meta.env.${key}`] = `'${env[key]!}'`
            return acc
          },
          {} as Record<string, string>,
        )
        return Object.keys(replacements).reduce((acc, key) => {
          return acc.replace(key, replacements[key])
        }, code)
      }
    },
  }
}
