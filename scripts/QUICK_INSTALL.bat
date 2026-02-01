@echo off
REM Quick install script that excludes fasttext
echo ========================================
echo Installing Dependencies (fasttext excluded)
echo ========================================
echo.

REM Activate venv
if exist .venv311\Scripts\activate.bat (
    call .venv311\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    echo Please run: py -3.11 -m venv .venv311
    pause
    exit /b 1
)

echo.
echo Installing core packages...
echo.

REM Install packages from requirements.txt, but skip fasttext
python -m pip install --upgrade pip
python -m pip install numpy>=1.24.0 scipy>=1.11.0 python-dotenv>=1.0.0 Pillow>=10.0.0
python -m pip install pyaudio>=0.2.14 sounddevice>=0.4.6 pydub>=0.25.1 pygame>=2.5.0
python -m pip install openai-whisper>=20231117
python -m pip install deep-translator>=1.11.4 googletrans==4.0.0rc1 sentencepiece>=0.1.99
python -m pip install torch>=2.0.0 torchaudio>=2.0.0 transformers>=4.30.0
python -m pip install easynmt>=2.0.0
python -m pip install PyQt6>=6.6.0
python -m pip install pyttsx3>=2.90 gtts>=2.5.0
python -m pip install pyinstaller>=6.0.0 cryptography>=41.0.0 psutil>=5.9.0
python -m pip install pypresence>=4.2.1 discord.py>=2.3.0 obs-websocket-py>=1.0.0 keyboard>=0.13.5

REM Try to install TTS, but ignore fasttext errors
echo.
echo Installing TTS (fasttext errors can be ignored)...
python -m pip install TTS>=0.20.0 2>&1 | findstr /v "fasttext"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Note: If you saw fasttext errors, they can be safely ignored.
echo fasttext is NOT required for this project.
echo.
pause
