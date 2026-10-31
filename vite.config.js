
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'spa',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    modulePreload: {
      polyfill: false
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
