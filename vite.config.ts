import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { removeCrossorigin } from './vite-plugin-remove-crossorigin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './', // 使用相对路径，确保打包后可以直接打开使用
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), removeCrossorigin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // 移除 crossorigin 属性，避免直接打开 HTML 时的 CORS 问题
        rollupOptions: {
          output: {
            // 确保资源使用相对路径
            assetFileNames: 'assets/[name].[ext]',
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
          }
        }
      }
    };
});
