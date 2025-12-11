import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are linked relatively for GitHub Pages
  define: {
    // This allows process.env.API_KEY to be replaced during build if set in the environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY) 
  },
  build: {
    outDir: 'dist',
  }
});