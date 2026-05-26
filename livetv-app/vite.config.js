import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/yt-proxy': {
        target: 'https://www.youtube.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yt-proxy/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        youtube: resolve(__dirname, 'youtube.html'),
        ytmusic: resolve(__dirname, 'ytmusic.html'),
      }
    }
  }
})
