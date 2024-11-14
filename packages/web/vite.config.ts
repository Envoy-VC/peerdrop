import peerbit from '@peerbit/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  envPrefix: ['VITE_'],
  plugins: [
    TanStackRouterVite({}),
    react(),
    peerbit(),
    nodePolyfills({ protocolImports: true }),
  ],
  server: { port: 3000 },
  build: {
    target: 'esnext',
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      public: path.resolve(__dirname, './public'),
    },
  },
});
