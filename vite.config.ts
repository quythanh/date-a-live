import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

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
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@hazart-pkg/live2d-core/live2dcubismcore.min.js',
          dest: 'assets/js/libs'
        }
      ]
    })
  ],
  server: {
    host: '0.0.0.0',
  }
})
