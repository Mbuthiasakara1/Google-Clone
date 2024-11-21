import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      'http://localhost:5555/api': {
        target: '', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\api/, ''),
      },
    },
  },
  plugins: [react()],
});
