import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['process', 'util', 'stream', 'buffer', 'events'],
      globals: {
        process: true,
        Buffer: true,
        global: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@atoms': path.resolve(__dirname, './src/components/atoms'),
      '@molecules': path.resolve(__dirname, './src/components/molecules'),
      '@organisms': path.resolve(__dirname, './src/components/organisms'),
      '@templates': path.resolve(__dirname, './src/components/templates'),
      '@screens': path.resolve(__dirname, './src/screens'),
      '@tokens': path.resolve(__dirname, './src/tokens'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@workflows': path.resolve(__dirname, './src/workflows'),
      // Polyfill Node.js modules
      'node:async_hooks': path.resolve(__dirname, './src/lib/async-hooks-polyfill.ts'),
      'async_hooks': path.resolve(__dirname, './src/lib/async-hooks-polyfill.ts'),
    },
  },
  define: {
    // Define global constants
    'process.env': {},
    global: 'globalThis',
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['es2021', 'chrome100', 'safari13'],
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
})