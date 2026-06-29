@echo off
title SecureSurf AI - Frontend
echo ============================================
echo  SecureSurf AI Frontend (React + Vite)
echo  Dashboard: http://localhost:5173
echo ============================================
echo.

cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)

echo Starting Vite development server...
npm run dev
pause
