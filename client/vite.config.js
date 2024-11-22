import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      'https://google-drive-clone-v6g6.onrender.com': {
        target: '', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\api/, ''),
      },
    },
  },
  plugins: [react()],
});
