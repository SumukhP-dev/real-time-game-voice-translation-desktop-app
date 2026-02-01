@echo off
REM Install all dependencies, allowing fasttext to fail
echo ========================================
echo Installing Dependencies (fasttext will be skipped)
echo ========================================
echo.

if exist .venv311\Scripts\activate.bat (
    call .venv311\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    pause
    exit /b 1
)

echo.
echo Installing packages from requirements.txt...
echo Note: fasttext errors are expected and can be ignored
echo.

REM Install requirements - fasttext will fail but that's OK
python -m pip install -r requirements.txt 2>&1 | findstr /v /i "fasttext" | findstr /v /i "Building wheel for fasttext"

echo.
echo ========================================
echo Installation attempt complete
echo ========================================
echo.
echo If fasttext failed (expected), the rest should be installed.
echo Let's verify key packages...
echo.

python -c "import numpy; print('✓ numpy')" 2>nul || echo ✗ numpy missing
python -c "import scipy; print('✓ scipy')" 2>nul || echo ✗ scipy missing
python -c "import torch; print('✓ torch')" 2>nul || echo ✗ torch missing
python -c "import whisper; print('✓ whisper')" 2>nul || echo ✗ whisper missing
python -c "import PyQt6; print('✓ PyQt6')" 2>nul || echo ✗ PyQt6 missing

echo.
echo If all packages show ✓, you're ready to run the app!
echo fasttext is NOT required and can be ignored.
echo.
pause
