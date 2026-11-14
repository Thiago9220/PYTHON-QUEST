import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ...(mode === 'steam'
    ? {
        define: {
          'import.meta.env.VITE_PLATFORM': JSON.stringify('steam'),
          'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(''),
          'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(''),
          'import.meta.env.VITE_TURNSTILE_SITE_KEY': JSON.stringify(''),
        },
      }
    : {}),
}));
