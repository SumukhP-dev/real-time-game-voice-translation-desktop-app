@echo off
REM Comprehensive dependency installer - installs all required packages
echo ========================================
echo Installing All Dependencies
echo ========================================
echo.

if exist .venv311\Scripts\activate.bat (
    call .venv311\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    echo Please run: py -3.11 -m venv .venv311
    pause
    exit /b 1
)

echo Installing all required packages...
echo This may take a few minutes...
echo.

REM Core packages
echo [1/8] Installing core packages...
python -m pip install numpy>=1.24.0 scipy>=1.11.0 python-dotenv>=1.0.0 Pillow>=10.0.0

REM Audio capture
echo [2/8] Installing audio capture packages...
python -m pip install pyaudio>=0.2.14 sounddevice>=0.4.6

REM Speech recognition
echo [3/8] Installing speech recognition...
python -m pip install openai-whisper>=20231117

REM Translation
echo [4/8] Installing translation packages...
python -m pip install deep-translator>=1.11.4 googletrans==4.0.0rc1 sentencepiece>=0.1.99

REM PyTorch and ML
echo [5/8] Installing PyTorch and ML packages (this may take a while)...
python -m pip install torch>=2.0.0 torchaudio>=2.0.0 transformers>=4.30.0

REM EasyNMT
echo [6/8] Installing EasyNMT...
python -m pip install easynmt>=2.0.0

REM TTS
echo [7/8] Installing text-to-speech packages...
python -m pip install pyttsx3>=2.90 gtts>=2.5.0 pydub>=0.25.1 pygame>=2.5.0

REM GUI and other
echo [8/8] Installing GUI and other packages...
python -m pip install PyQt6>=6.6.0 pyinstaller>=6.0.0 cryptography>=41.0.0 psutil>=5.9.0
python -m pip install pypresence>=4.2.1 discord.py>=2.3.0 obs-websocket-py>=1.0.0 keyboard>=0.13.5

echo.
echo ========================================
echo Verifying Installation
echo ========================================
echo.

python -c "import numpy; print('✓ numpy')" 2>nul || echo "✗ numpy"
python -c "import scipy; print('✓ scipy')" 2>nul || echo "✗ scipy"
python -c "import torch; print('✓ torch')" 2>nul || echo "✗ torch"
python -c "import whisper; print('✓ whisper')" 2>nul || echo "✗ whisper"
python -c "import PyQt6; print('✓ PyQt6')" 2>nul || echo "✗ PyQt6"
python -c "import pyttsx3; print('✓ pyttsx3')" 2>nul || echo "✗ pyttsx3"
python -c "import gtts; print('✓ gtts')" 2>nul || echo "✗ gtts"
python -c "import sounddevice; print('✓ sounddevice')" 2>nul || echo "✗ sounddevice"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Note: If you see fasttext errors during installation, they can be ignored.
echo fasttext is NOT required for this project.
echo.
echo You can now try running: python src/main.py
echo.
pause
