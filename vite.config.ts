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
            drop_console: true, 
            drop_debugger: true, 
            pure_funcs: ['console.log', 'console.info', 'console.debug'], 
            passes: 2, 
          },
          format: {
            comments: false, 
          },
        },
        cssMinify: true, 
        sourcemap: false, 
        chunkSizeWarningLimit: 1000, 
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                if (id.includes('firebase/auth')) {
                  return 'firebase-auth';
                }
                if (id.includes('firebase')) {
                  return 'firebase-vendor';
                }
                if (id.includes('marked')) {
                  return 'marked';
                }
                if (id.includes('dompurify')) {
                  return 'dompurify';
                }
                if (id.includes('jszip')) {
                  return 'jszip';
                }
                if (id.includes('@google/genai')) {
                  return 'genai';
                }
                return 'vendor';
              }
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
