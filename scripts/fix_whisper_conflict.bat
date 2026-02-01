@echo off
echo ========================================
echo Fixing Whisper Package Conflict
echo ========================================
echo.

if exist .venv311\Scripts\activate.bat (
    call .venv311\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    pause
    exit /b 1
)

echo Step 1: Removing any conflicting whisper packages...
python -m pip uninstall -y whisper 2>nul
python -m pip uninstall -y openai-whisper 2>nul

echo.
echo Step 2: Removing conflicting whisper.py file if it exists...
if exist ".venv311\Lib\site-packages\whisper.py" (
    del ".venv311\Lib\site-packages\whisper.py"
    echo   Removed conflicting whisper.py file
) else (
    echo   No conflicting file found
)

echo.
echo Step 3: Installing correct openai-whisper package...
python -m pip install --force-reinstall --no-cache-dir openai-whisper>=20231117

echo.
echo Step 4: Verifying installation...
python -c "import whisper; print('✓ Whisper installed correctly'); print('  Path:', whisper.__file__)" 2>nul
if errorlevel 1 (
    echo ✗ Whisper installation failed
    echo.
    echo Try running: python -m pip install openai-whisper
) else (
    echo.
    echo ========================================
    echo Fix Complete!
    echo ========================================
    echo You can now run: python src/main.py
)

echo.
pause
