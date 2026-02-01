@echo off
REM Activate Python 3.11 virtual environment
echo Activating Python 3.11 virtual environment...

if not exist .venv311 (
    echo Creating .venv311 virtual environment with Python 3.11...
    py -3.11 -m venv .venv311
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        echo Make sure Python 3.11 is installed.
        echo Download from: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    echo Virtual environment created successfully!
)

call .venv311\Scripts\activate.bat

echo.
echo Virtual environment activated!
echo Python version:
python --version
echo.
echo To install dependencies, run:
echo   pip install -r requirements.txt
echo.
echo To deactivate, run:
echo   deactivate
