import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      'http://i27.0.0.1:5555/api': {
        target: '', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\http://i27.0.0.1:5555/api/, ''),
      },
    },
  },
  plugins: [react()],
});
