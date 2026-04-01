import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
            "/api": "http://localhost:3000",
            "/uploads": "http://localhost:3000"
        }
  },
  plugins: [
    tailwindcss(),
  ],
})