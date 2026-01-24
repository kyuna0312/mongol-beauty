import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mongol-beauty/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
    preserveSymlinks: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  // Suppress source map warnings in console (they're harmless)
  logLevel: 'warn', // Only show warnings and errors, not info messages
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple passes for better compression
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - optimized splitting
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // GraphQL & Apollo
            if (id.includes('@apollo') || id.includes('graphql')) {
              return 'apollo-vendor';
            }
            // Chakra UI
            if (id.includes('@chakra-ui') || id.includes('@emotion') || id.includes('framer-motion')) {
              return 'chakra-vendor';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Other vendor code
            return 'vendor';
          }
          // Return undefined for non-vendor chunks (let Vite handle them)
          return undefined;
        },
        // Optimize chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
      // Tree shaking optimization
      treeshake: {
        moduleSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable source maps in production for debugging (optional)
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@apollo/client',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'lucide-react',
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // Improve build performance
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
});
