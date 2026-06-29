@echo off
title SecureSurf AI - Setup
echo ============================================
echo  SecureSurf AI - First-Time Setup
echo ============================================
echo.

echo [1/3] Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)

echo.
echo [2/3] Installing frontend npm dependencies...
cd frontend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install npm packages.
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Generating Chrome extension icons...
python generate_icons.py
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Icon generation failed. Run 'python generate_icons.py' manually.
)

echo.
echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo Next steps:
echo   1. Train the ML model:   cd model ^&^& python train_model.py
echo   2. Start the backend:    start_backend.bat
echo   3. Start the frontend:   start_frontend.bat
echo.
pause
