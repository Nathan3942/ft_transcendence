import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: {
      host: "192.168.1.40",
      port: 5173,
    }
  },
  plugins: [
    tailwindcss(),
  ],
})