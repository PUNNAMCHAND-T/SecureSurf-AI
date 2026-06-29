@echo off
title SecureSurf AI - Backend
echo ============================================
echo  SecureSurf AI Backend (FastAPI)
echo  API: http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo ============================================
echo.

cd /d "%~dp0backend"

REM Check if model is trained
if not exist "..\model\saved_models\best_model.joblib" (
    echo WARNING: ML model not found. Training now...
    echo.
    cd /d "%~dp0model"
    python train_model.py
    cd /d "%~dp0backend"
)

echo Starting FastAPI server...
python main.py
pause
