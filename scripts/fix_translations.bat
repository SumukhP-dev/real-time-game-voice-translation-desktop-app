@echo off
title Fix Translation Dependencies
echo ========================================
echo Fixing Translation Dependencies
echo ========================================
echo.
echo IMPORTANT: Close the application first!
echo.
pause

cd /d "%~dp0"

echo Activating virtual environment...
if not exist ".venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo.
echo Installing translation libraries...
.venv\Scripts\python.exe -m pip install --upgrade deep-translator googletrans==4.0.0rc1

echo.
echo Testing installation...
.venv\Scripts\python.exe -c "from deep_translator import GoogleTranslator; t = GoogleTranslator(source='auto', target='fr'); result = t.translate('Hello'); print(f'Test: Hello -> {result}')"

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Now restart the application using run_app.bat
echo.
pause
