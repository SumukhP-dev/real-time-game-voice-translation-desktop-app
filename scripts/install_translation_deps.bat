@echo off
title Install Translation Dependencies
cd /d "%~dp0"
echo ========================================
echo Installing Translation Dependencies
echo ========================================
echo.

echo Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Virtual environment not found!
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
)

echo.
echo Installing deep-translator...
.venv\Scripts\python.exe -m pip install deep-translator --quiet
if errorlevel 1 (
    echo ERROR: Failed to install deep-translator
) else (
    echo ✓ deep-translator installed
)

echo.
echo Installing googletrans...
.venv\Scripts\python.exe -m pip install googletrans==4.0.0rc1 --quiet
if errorlevel 1 (
    echo ERROR: Failed to install googletrans
) else (
    echo ✓ googletrans installed
)

echo.
echo Verifying installation...
.venv\Scripts\python.exe -c "from deep_translator import GoogleTranslator; print('✓ deep-translator: OK')" 2>nul || echo ✗ deep-translator: FAILED
.venv\Scripts\python.exe -c "from googletrans import Translator; print('✓ googletrans: OK')" 2>nul || echo ✗ googletrans: FAILED

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo IMPORTANT: Restart the application for changes to take effect.
echo.
pause
