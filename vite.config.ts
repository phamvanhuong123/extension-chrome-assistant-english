import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' with{type: 'json'}
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    crx({
      manifest
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  server: {
    cors: {
      origin: [
        /chrome-extension:\/\//, // Cho phép tất cả các chrome-extension truy cập dev server
      ],
    },
  },
  legacy: {
    // Bỏ qua kiểm tra mã token của WebSocket giúp tính năng Hot Reload hoạt động mượt mà
    skipWebSocketTokenCheck: true,
  },
})
