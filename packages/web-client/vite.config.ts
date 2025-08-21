import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'DreamCrafter',
        short_name: 'DreamCrafter',
        description: 'AI-Powered Match-3 Adventure',
        theme_color: '#4a90e2',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dreamcrafter/game-engine': path.resolve(__dirname, '../game-engine/src'),
      '@dreamcrafter/ai-service': path.resolve(__dirname, '../ai-service/src'),
      '@dreamcrafter/shared-types': path.resolve(__dirname, '../shared-types/src')
    }
  },
  server: {
    port: 5174,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'game-vendor': ['phaser', 'pixi.js'],
          'animation-vendor': ['framer-motion', 'gsap']
        }
      }
    }
  }
});