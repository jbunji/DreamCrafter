import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DreamCrafterEngine',
      formats: ['es', 'umd'],
      fileName: (format) => `dreamcrafter-engine.${format}.js`,
    },
    rollupOptions: {
      external: ['phaser'],
      output: {
        globals: {
          phaser: 'Phaser',
        },
      },
    },
  },
  server: {
    port: 5174,
    open: '/demo.html',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});