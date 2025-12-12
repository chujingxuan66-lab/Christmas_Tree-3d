# 🚨 GitHub Pages 部署修复指南

## 问题诊断

从网络请求日志可以看到，浏览器在尝试加载 `index.tsx`（源文件），这说明：
- ❌ 部署的是源文件，而不是构建后的 `dist` 目录
- ❌ 或者 GitHub Pages 配置选择了错误的源目录

## ✅ 解决方案

### 方法一：使用 GitHub Actions 自动部署（推荐）

1. **确保工作流文件已提交：**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment"
   git push
   ```

2. **配置 GitHub Pages：**
   - 进入 GitHub 仓库：**Settings** > **Pages**
   - 在 **Source** 中选择 **GitHub Actions**（不是 Branch）
   - 保存设置

3. **触发部署：**
   - 推送代码到 `main` 或 `master` 分支
   - 或者手动触发：**Actions** 标签 > **Deploy to GitHub Pages** > **Run workflow**

4. **等待部署完成：**
   - 在 **Actions** 标签中查看部署进度
   - 部署完成后，访问你的 GitHub Pages 地址

### 方法二：手动部署（如果方法一不行）

1. **在本地构建（需要 Node.js 18+）：**
   ```bash
   npm run build:gh-pages
   ```

2. **检查构建结果：**
   打开 `dist/index.html`，确认它引用的是：
   ```html
   <script type="module" src="./assets/index.js"></script>
   ```
   而不是：
   ```html
   <script type="module" src="/index.tsx"></script>
   ```

3. **部署 dist 目录：**
   
   **选项 A：使用 gh-pages 分支**
   ```bash
   # 安装 gh-pages（如果还没有）
   npm install -D gh-pages
   
   # 添加到 package.json scripts
   # "deploy": "gh-pages -d dist"
   
   # 部署
   npm run deploy
   ```
   
   **选项 B：手动推送**
   ```bash
   # 切换到 dist 目录
   cd dist
   
   # 初始化 git（如果还没有）
   git init
   git add .
   git commit -m "Deploy to GitHub Pages"
   
   # 推送到 gh-pages 分支
   git branch -M gh-pages
   git remote add origin <your-repo-url>
   git push -u origin gh-pages
   ```

4. **配置 GitHub Pages：**
   - 进入 **Settings** > **Pages**
   - 在 **Source** 中选择 **Deploy from a branch**
   - 选择 `gh-pages` 分支和 `/ (root)` 目录
   - 保存

## 🔍 验证部署

部署完成后，检查：

1. **访问你的 GitHub Pages 地址**
2. **打开浏览器开发者工具（F12）**
3. **查看 Network 标签：**
   - ✅ 应该看到 `assets/index.js` 和 `assets/index.css` 加载成功
   - ❌ 不应该看到 `index.tsx` 的请求

## ⚠️ 常见错误

### 错误：404 Not Found for index.tsx
**原因：** 部署了源文件而不是构建后的文件
**解决：** 确保部署的是 `dist` 目录的内容

### 错误：资源路径不正确
**原因：** base 路径配置错误
**解决：** 使用 `npm run build:gh-pages` 构建，确保 base 路径是 `/Christmas_Tree-3d/`

### 错误：GitHub Actions 构建失败
**原因：** 可能是依赖问题
**解决：** 检查 Actions 日志，确保 `package.json` 和 `package-lock.json` 已提交

## 📝 检查清单

- [ ] `.github/workflows/deploy.yml` 文件已提交
- [ ] GitHub Pages 源设置为 **GitHub Actions**
- [ ] 代码已推送到 `main` 或 `master` 分支
- [ ] GitHub Actions 工作流运行成功
- [ ] 访问页面时，Network 标签显示正确的资源文件

