import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  build: {
    // Optimize chunk splitting for faster loading (Core Web Vitals)
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // SEO helmet (small, shared across all pages)
          helmet: ['react-helmet-async'],
          // Animation library (~150KB)
          'framer-motion': ['framer-motion'],
          // Monaco code editor (~1MB+ — only loaded on CodeArena)
          monaco: ['@monaco-editor/react'],
          // Three.js 3D rendering (~600KB — only loaded where needed)
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          // PDF/Canvas export utilities (~250KB)
          export: ['html2canvas', 'jspdf'],
          // Real-time communication
          socket: ['socket.io-client'],
          // Icon library (~100KB tree-shaken)
          icons: ['lucide-react'],
        },
      },
    },
    // Inline small assets for fewer HTTP requests
    assetsInlineLimit: 4096,
    // Disable source maps in production for smaller bundles
    sourcemap: false,
    // Enable CSS code splitting for faster initial load
    cssCodeSplit: true,
    // Minify with esbuild (faster than terser)
    minify: 'esbuild',
    // Target modern browsers for smaller output
    target: 'es2020',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
