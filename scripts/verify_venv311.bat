@echo off
echo ========================================
echo Verifying Python 3.11 Virtual Environment
echo ========================================
echo.

if exist .venv311\Scripts\python.exe (
    echo [OK] Virtual environment exists
    echo.
    echo Python version in .venv311:
    .venv311\Scripts\python.exe --version
    echo.
    echo Python path:
    .venv311\Scripts\python.exe -c "import sys; print(sys.executable)"
    echo.
    echo ========================================
    echo Virtual environment is ready!
    echo.
    echo To activate, run:
    echo   activate_venv311.bat
    echo.
    echo Or manually:
    echo   .venv311\Scripts\activate.bat
    echo ========================================
) else (
    echo [ERROR] Virtual environment not found!
    echo.
    echo Creating .venv311 now...
    py -3.11 -m venv .venv311
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to create virtual environment.
        echo Make sure Python 3.11 is installed.
        echo.
        echo Check available Python versions:
        py --list
        echo.
        echo Download Python 3.11 from:
        echo https://www.python.org/downloads/
    ) else (
        echo [OK] Virtual environment created successfully!
        echo.
        echo To activate, run:
        echo   activate_venv311.bat
    )
)
echo.
pause
