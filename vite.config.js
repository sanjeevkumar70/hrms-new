import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          forms: ['react-hook-form', '@hookform/resolvers', 'yup'],
          charts: ['recharts', 'chart.js', 'react-chartjs-2'],
          ui: ['reactstrap', 'bootstrap', 'react-data-table-component', 'react-toastify', 'framer-motion'],
        },
      },
    },
  },
})
