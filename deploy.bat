@echo off
chcp 65001 >nul
echo ========================================
echo   潮汐 Tide - 一键部署脚本
echo ========================================
echo.

set /p "REPO_URL=请输入你的 GitHub 仓库地址 (格式: https://github.com/用户名/仓库名.git): "
echo.

echo [1/5] 初始化 Git 仓库...
cd /d "%~dp0"
if not exist ".git" (
    git init
    git config user.name "tide-deploy"
    git config user.email "deploy@tide.local"
)

echo [2/5] 添加远程仓库...
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"

echo [3/5] 添加所有文件...
git add .

echo [4/5] 提交代码...
git commit -m "deploy: 潮汐 Tide 应用"

echo [5/5] 推送到 GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 下一步：
echo 1. 打开 https://render.com
echo 2. 创建 Web Service
echo 3. 选择你的仓库
echo 4. 配置以下参数：
echo    - Build Command: cd frontend && npm install && npm run build && cp -r dist/* ../backend/public/
echo    - Start Command: cd backend && npm install && npm start
echo    - Environment Variables: PORT=10000
echo.
pause