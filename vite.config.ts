import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      base: mode === 'production' && process.env.GITHUB_PAGES ? '/stuff-md/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        splitVendorChunkPlugin(),
        mode === 'production' && visualizer({ 
          filename: 'dist/stats.html', 
          gzipSize: true,
          open: false,
        })
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      },
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console statements
            drop_debugger: true, // Remove debugger statements
            pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
            passes: 2, // Multiple passes for better compression
          },
          format: {
            comments: false, // Remove all comments
          },
        },
        cssMinify: true, // Explicitly enable CSS minification
        sourcemap: false, // Disable source maps in production for smaller builds
        chunkSizeWarningLimit: 1000, // Warn on chunks larger than 1MB
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Split node_modules into separate chunks
              if (id.includes('node_modules')) {
                // React and React DOM - separate chunk
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                // Firebase Auth - large bundle, separate it
                if (id.includes('firebase/auth')) {
                  return 'firebase-auth';
                }
                // Other Firebase modules
                if (id.includes('firebase')) {
                  return 'firebase-vendor';
                }
                // Marked and DOMPurify - already lazy loaded but better to chunk separately
                if (id.includes('marked')) {
                  return 'marked';
                }
                if (id.includes('dompurify')) {
                  return 'dompurify';
                }
                // JSZip for exports
                if (id.includes('jszip')) {
                  return 'jszip';
                }
                // Google GenAI
                if (id.includes('@google/genai')) {
                  return 'genai';
                }
                // All other node_modules
                return 'vendor';
              }
              // Split large local components into separate chunks
              if (id.includes('/src/components/NoteList.tsx') || id.includes('\\src\\components\\NoteList.tsx')) {
                return 'note-list';
              }
              if (id.includes('/src/components/MainLayout.tsx') || id.includes('\\src\\components\\MainLayout.tsx')) {
                return 'main-layout';
              }
              if (id.includes('/src/components/MarkdownRenderer.tsx') || id.includes('\\src\\components\\MarkdownRenderer.tsx')) {
                return 'markdown-renderer';
              }
            },
          },
        },
      },
    };
});
