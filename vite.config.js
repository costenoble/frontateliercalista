import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    host: true,
    cors: true,
    allowedHosts: true,
  },
  resolve: {
    alias: [
      { find: /^lucide-react$/, replacement: path.resolve(__dirname, './src/lib/lucide-direct.js') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
