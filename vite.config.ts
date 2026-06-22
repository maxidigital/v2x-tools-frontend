import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Dev proxy: same-origin `/api/*` is served by Caddy in prod (→ hub/backend).
// In dev we forward to a local hub or the prod hub. Override with VITE_API_TARGET.
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true, secure: false },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          codemirror: [
            '@uiw/react-codemirror',
            '@codemirror/lang-json',
            '@codemirror/lang-xml',
            '@codemirror/view',
            '@codemirror/state',
          ],
        },
      },
    },
  },
});
