@echo off
echo Installing all required dependencies...
echo.
cd /d "%~dp0"
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
echo.
echo Installation complete!
echo.
python -c "import sounddevice, pyaudio, psutil; print('✓ All dependencies verified')"
pause
