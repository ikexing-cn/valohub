import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  cjsInterop: true,
  watch: !!process.env.DEV,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          customConditions: [],
        },
      },
  tsconfig: './tsconfig.json',
  clean: true,
  minify: !process.env.DEV,
  treeshake: true,
  bundle: true,
  external: ['zod'],
})
