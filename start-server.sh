#!/bin/bash

# 圣诞树项目 - 本地服务器启动脚本
# 使用方法：双击此文件或在终端运行 ./start-server.sh

echo "🎄 正在启动本地服务器..."
echo ""

# 检查 index.html 是否存在
if [ ! -f "index.html" ]; then
    echo "错误：找不到 index.html 文件"
    echo "请确保在包含 index.html 的目录中运行此脚本"
    exit 1
fi

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    echo "使用 Python 启动服务器..."
    echo "服务器地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "使用 Python 启动服务器..."
    echo "服务器地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "使用 Node.js serve 启动服务器..."
    npx serve . -p 8000
else
    echo "错误：未找到 Python 或 Node.js"
    echo "请安装 Python 3 或 Node.js"
    exit 1
fi

