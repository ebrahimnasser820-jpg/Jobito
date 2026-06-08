import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      registry: path.resolve(__dirname, './src/registry'),
    },
  },
  server: {
    // Fix: SPA fallback — prevents 404 on direct URL access (e.g. /user-information)
    historyApiFallback: true,
    headers: {
      // Fix: Allow Google Sign-In postMessage to work without COOP warnings
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
