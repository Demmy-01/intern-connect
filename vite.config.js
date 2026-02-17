import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // if you're using React

export default defineConfig({
  plugins: [react()], // your existing plugins
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  // This ensures the worker file is properly handled
  worker: {
    format: 'es'
  },
  // Proxy API requests to backend server in development
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  }
});