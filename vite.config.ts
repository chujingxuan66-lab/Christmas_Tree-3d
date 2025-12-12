import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { removeCrossorigin } from './vite-plugin-remove-crossorigin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // 支持通过环境变量设置 base 路径，用于 GitHub Pages 等子路径部署
    // 如果设置了 VITE_BASE_PATH，使用该值；否则根据 BUILD_FOR_LOCAL 决定
    const basePath = process.env.VITE_BASE_PATH || 
                     (process.env.BUILD_FOR_LOCAL === 'false' ? '/Christmas_Tree-3d/' : './');
    
    return {
      base: basePath,
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
