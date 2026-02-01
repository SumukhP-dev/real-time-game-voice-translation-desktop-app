@echo off
echo ========================================
echo Installing Requirements in .venv311
echo ========================================
echo.

REM Check if virtual environment exists
if not exist .venv311\Scripts\python.exe (
    echo Creating .venv311 virtual environment...
    py -3.11 -m venv .venv311
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        echo Make sure Python 3.11 is installed.
        pause
        exit /b 1
    )
    echo Virtual environment created!
    echo.
)

echo Activating virtual environment...
call .venv311\Scripts\activate.bat

echo.
echo Python version:
python --version
echo.

echo Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Installing requirements from requirements.txt...
echo This may take several minutes...
echo.
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo ERROR: Some packages failed to install.
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Verifying key packages...
python -c "import sys; print(f'Python: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>nul
python -c "import torch; print(f'PyTorch: {torch.__version__}')" 2>nul || echo PyTorch: Not installed
python -c "import whisper; print('Whisper: OK')" 2>nul || echo Whisper: Not installed
python -c "import TTS; print('TTS: OK')" 2>nul || echo TTS: Not installed (requires Python 3.9-3.11)
python -c "import pyaudio; print('PyAudio: OK')" 2>nul || echo PyAudio: Not installed
python -c "import sounddevice; print('SoundDevice: OK')" 2>nul || echo SoundDevice: Not installed
echo.
echo Virtual environment is ready!
echo.
echo To activate in the future, run:
echo   activate_venv311.bat
echo.
pause
