import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  outDir: 'dist',
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: ['node-fetch-native/proxy'],
  entries: ['./src/index.ts'],
})
