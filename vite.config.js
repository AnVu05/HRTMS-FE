import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 1. Import thêm module path của Node.js

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 2. Định nghĩa ký tự '@' trỏ tới thư mục 'src'
    },
  },
})
