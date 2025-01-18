// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })







import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Optional: Use `@` as a shortcut for `/src` if preferred
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/database', 'firebase/auth'], // Ensure Firebase modules are pre-bundled
  },
});
