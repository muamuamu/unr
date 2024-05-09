import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: './examples',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'examples/index.html'),
      },
    },
  },
  plugins: [vue()]
})