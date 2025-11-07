import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Set base path for GitHub Pages project repository
  // Repository: n-dryer/stuff-md -> Deploys to: https://n-dryer.github.io/stuff-md/
  const base = '/stuff-md/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
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
          manualChunks: (id): string | undefined => {
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
            if (
              id.includes('/src/components/NoteList.tsx') ||
              id.includes('\\src\\components\\NoteList.tsx')
            ) {
              return 'note-list';
            }
            if (
              id.includes('/src/components/MainLayout.tsx') ||
              id.includes('\\src\\components\\MainLayout.tsx')
            ) {
              return 'main-layout';
            }
            if (
              id.includes('/src/components/MarkdownRenderer.tsx') ||
              id.includes('\\src\\components\\MarkdownRenderer.tsx')
            ) {
              return 'markdown-renderer';
            }
            return undefined;
          },
        },
      },
    },
  };
});
