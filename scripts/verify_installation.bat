@echo off
echo Verifying installation...
echo.

if exist .venv311\Scripts\activate.bat (
    call .venv311\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    pause
    exit /b 1
)

echo Checking core packages:
python -c "import numpy; print('  ✓ numpy')" 2>nul || echo "  ✗ numpy - MISSING"
python -c "import scipy; print('  ✓ scipy')" 2>nul || echo "  ✗ scipy - MISSING"
python -c "import torch; print('  ✓ torch')" 2>nul || echo "  ✗ torch - MISSING"
python -c "import whisper; print('  ✓ whisper')" 2>nul || echo "  ✗ whisper - MISSING"
python -c "import PyQt6; print('  ✓ PyQt6')" 2>nul || echo "  ✗ PyQt6 - MISSING"
python -c "import sounddevice; print('  ✓ sounddevice')" 2>nul || echo "  ✗ sounddevice - MISSING"

echo.
echo Note: fasttext is NOT required and can be ignored if it failed to install.
echo.
pause
