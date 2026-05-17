import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseUrl = env.API_BASE_URL || env.VITE_API_BASE_URL || '/api';

  return defineConfig({
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(baseUrl)
    },
    server: {
      host: true,
      port: 4173,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  });
};
