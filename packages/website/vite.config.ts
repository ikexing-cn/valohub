import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Solid from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    Solid(),
    UnoCSS(),
    AutoImport({
      dts: './src/types/auto-imports.d.ts',
      imports: ['solid-js', '@solidjs/router'],
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
})
