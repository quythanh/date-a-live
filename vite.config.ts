import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dailydate: resolve(__dirname, 'dailydate.html'),
        live2dv3: resolve(__dirname, 'live2dv3.html'),
      }
    }
  }
})
