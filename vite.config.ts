import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ballop-pms/', // GitHub Pages 레포지토리 이름과 일치시킴
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})