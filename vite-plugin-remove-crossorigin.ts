import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, copyFileSync, existsSync, chmodSync } from 'fs';
import { join } from 'path';

/**
 * Vite 插件：移除构建后 HTML 中的 crossorigin 属性（仅用于本地分发）
 * 并复制启动脚本到 dist 目录
 * 
 * 注意：线上部署时不需要移除 crossorigin，因为通过 HTTP/HTTPS 访问不会有 CORS 问题
 * 可以通过环境变量 BUILD_FOR_LOCAL=true 来控制是否移除
 */
export function removeCrossorigin(): Plugin {
  return {
    name: 'remove-crossorigin',
    apply: 'build',
    closeBundle() {
      const distPath = join(process.cwd(), 'dist');
      const htmlPath = join(distPath, 'index.html');
      
      // 检查是否是为本地分发构建（默认是，除非明确设置为 false）
      const buildForLocal = process.env.BUILD_FOR_LOCAL !== 'false';
      
      // 1. 移除 HTML 中的 crossorigin 属性（仅用于本地分发）
      if (buildForLocal) {
        try {
          if (existsSync(htmlPath)) {
            let html = readFileSync(htmlPath, 'utf-8');
            // 移除所有 crossorigin 属性
            html = html.replace(/\s+crossorigin="[^"]*"/g, '');
            html = html.replace(/\s+crossorigin/g, '');
            writeFileSync(htmlPath, html, 'utf-8');
            console.log('✓ 已移除 HTML 中的 crossorigin 属性（本地分发模式）');
          }
        } catch (error) {
          console.warn('⚠ 无法处理 HTML 文件:', error);
        }
      } else {
        console.log('ℹ 保留 crossorigin 属性（线上部署模式）');
      }

      // 2. 复制启动脚本和使用说明到 dist 目录
      const files = [
        { src: 'start-server.sh', dest: 'start-server.sh' },
        { src: 'start-server.bat', dest: 'start-server.bat' },
        { src: '使用说明.txt', dest: '使用说明.txt' },
      ];

      files.forEach(({ src, dest }) => {
        const srcPath = join(process.cwd(), src);
        const destPath = join(distPath, dest);
        
        try {
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
            // 如果是 shell 脚本，添加执行权限
            if (dest.endsWith('.sh')) {
              chmodSync(destPath, 0o755);
            }
            console.log(`✓ 已复制启动脚本: ${dest}`);
          }
        } catch (error) {
          console.warn(`⚠ 无法复制启动脚本 ${src}:`, error);
        }
      });
    },
  };
}

