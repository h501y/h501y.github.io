import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // GitHub Pages User site (h501y.github.io)
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
