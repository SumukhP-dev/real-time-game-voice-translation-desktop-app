@echo off
chcp 65001 >nul
title CS:GO 2 Translation - Error Capture
cd /d "%~dp0"
echo ========================================
echo Running application with error capture
echo ========================================
echo.
python -u src/main.py
echo.
echo ========================================
echo Application exited
echo ========================================
echo.
pause
