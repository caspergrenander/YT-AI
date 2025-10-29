import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import 'process' to provide type definitions for `process.cwd()`, resolving a TypeScript error.
import process from 'process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE || 'http://127.0.0.1:5000'),
    }
  }
});