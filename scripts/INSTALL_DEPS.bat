@echo off
echo ========================================
echo Installing Required Dependencies
echo ========================================
echo.

cd /d "%~dp0"

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Installing dependencies...
python -m pip install --upgrade pip
python -m pip install sounddevice pyaudio psutil

echo.
echo Verifying installation...
python -c "import sounddevice; print('✓ sounddevice installed')" 2>nul || echo ✗ sounddevice FAILED
python -c "import pyaudio; print('✓ pyaudio installed')" 2>nul || echo ✗ pyaudio FAILED  
python -c "import psutil; print('✓ psutil installed')" 2>nul || echo ✗ psutil FAILED

echo.
echo ========================================
echo Installation complete!
echo ========================================
pause
