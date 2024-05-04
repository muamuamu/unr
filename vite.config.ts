import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'

const isDev = process.env.NODE_ENV === 'development'
const prodBuild = {
  target: 'ES2015',
  lib: {
    entry: resolve(__dirname, 'src/index.ts'),
    formats: ['es', 'cjs'],
    fileName: 'index'
  }
}
const devBuild = {
  rollupOptions: {
    input: {
      main: resolve(__dirname, './examples/index.html'),
    },
  }
}

const config = {
  root: isDev ? './examples' : '',
  build: isDev ? devBuild : prodBuild,
  plugins: [isDev ? vue() : dts()]
} as any

export default defineConfig(config)