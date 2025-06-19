/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get the repository name from package.json or environment variable
// This will be used as the base path for GitHub Pages
const getBase = () => {
  // Default to the repository name from the URL or use a fallback
  return '/scrum-burn-check/';
};

export default defineConfig(() => ({
  root: __dirname,
  base: process.env.NODE_ENV === 'production' ? getBase() : '/',
  cacheDir: '../../node_modules/.vite/apps/scrum-tool',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
