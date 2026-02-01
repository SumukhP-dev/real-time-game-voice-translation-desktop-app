@echo off
title Install TTS Dependencies
echo ========================================
echo Installing TTS Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
if not exist ".venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo.
echo Installing gTTS and pygame...
.venv\Scripts\python.exe -m pip install --upgrade gtts pygame

echo.
echo Testing gTTS installation...
.venv\Scripts\python.exe -c "from gtts import gTTS; print('gTTS: OK')"

echo.
echo Testing pygame installation...
.venv\Scripts\python.exe -c "import pygame; pygame.mixer.init(); print('pygame: OK')"

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Now restart the application to use gTTS for non-English languages.
echo.
pause
