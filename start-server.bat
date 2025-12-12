@echo off
chcp 65001 >nul
echo 🎄 正在启动本地服务器...
echo.

REM 检查 index.html 是否存在
if not exist "index.html" (
    echo 错误：找不到 index.html 文件
    echo 请确保在包含 index.html 的目录中运行此脚本
    pause
    exit /b 1
)

REM 检查 Python 是否可用
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 Python 启动服务器...
    echo 服务器地址: http://localhost:8000
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
) else (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 (
        echo 使用 Python 3 启动服务器...
        echo 服务器地址: http://localhost:8000
        echo 按 Ctrl+C 停止服务器
        echo.
        python3 -m http.server 8000
    ) else (
        echo 错误：未找到 Python
        echo 请安装 Python 3
        pause
        exit /b 1
    )
)

