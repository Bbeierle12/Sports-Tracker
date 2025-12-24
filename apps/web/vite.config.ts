import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sports-tracker/types': path.resolve(__dirname, '../../packages/types/dist'),
    },
  },
  server: {
    port: 5173,
  },
})
