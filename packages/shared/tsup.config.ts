import { env } from 'node:process'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  cjsInterop: true,
  watch: !!env.DEV,
  dts: env.DEV
    ? false
    : {
        compilerOptions: {
          customConditions: [],
        },
      },
  tsconfig: './tsconfig.json',
  clean: true,
  treeshake: true,
  bundle: true,
  external: ['zod'],
})
