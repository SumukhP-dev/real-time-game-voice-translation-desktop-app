@echo off
REM Install any missing dependencies from requirements.txt
echo ========================================
echo Installing Missing Dependencies
echo ========================================
echo.

if exist .venv311\Scripts\activate.bat (
    call .venv311\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    pause
    exit /b 1
)

echo Installing missing packages...
echo.

REM Install packages one by one to catch any that fail
python -m pip install pyttsx3>=2.90
python -m pip install gtts>=2.5.0
python -m pip install pydub>=0.25.1
python -m pip install pygame>=2.5.0
python -m pip install pyaudio>=0.2.14
python -m pip install sounddevice>=0.4.6
python -m pip install deep-translator>=1.11.4
python -m pip install googletrans==4.0.0rc1
python -m pip install easynmt>=2.0.0
python -m pip install sentencepiece>=0.1.99
python -m pip install python-dotenv>=1.0.0
python -m pip install Pillow>=10.0.0

echo.
echo Verifying key packages...
python -c "import pyttsx3; print('✓ pyttsx3')" 2>nul || echo "✗ pyttsx3 missing"
python -c "import gtts; print('✓ gtts')" 2>nul || echo "✗ gtts missing"
python -c "import pydub; print('✓ pydub')" 2>nul || echo "✗ pydub missing"
python -c "import pygame; print('✓ pygame')" 2>nul || echo "✗ pygame missing"

echo.
echo ========================================
echo Installation Complete
echo ========================================
echo.
pause
