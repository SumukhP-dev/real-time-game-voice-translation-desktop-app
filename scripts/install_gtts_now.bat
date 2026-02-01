@echo off
title Install gTTS and pygame
echo Installing gTTS and pygame...
cd /d "%~dp0"
call .venv\Scripts\activate.bat
python -m pip install --upgrade gtts pygame
echo.
echo Installation complete! Please restart the application.
pause
