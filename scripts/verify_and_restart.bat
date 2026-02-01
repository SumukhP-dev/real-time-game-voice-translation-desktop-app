@echo off
title Verify Fixes and Restart App
echo ========================================
echo Verifying Translation Feed and Overlay Fixes
echo ========================================
echo.

echo Checking if fixes are in place...
findstr /C:"[PREVIEW] Attempting to add" "src\ui\main_window.py" >nul
if %errorlevel% equ 0 (
    echo [OK] Preview fix found in code
) else (
    echo [ERROR] Preview fix NOT found - code may be outdated
)

findstr /C:"[OVERLAY] Calling overlay_manager.show_text" "src\ui\main_window.py" >nul
if %errorlevel% equ 0 (
    echo [OK] Overlay fix found in code
) else (
    echo [ERROR] Overlay fix NOT found - code may be outdated
)

echo.
echo ========================================
echo IMPORTANT: Restart Instructions
echo ========================================
echo.
echo 1. Close the application completely (Stop Translation + Close Window)
echo 2. Run this script again or use: run_app.bat
echo 3. Look for these log messages in the terminal:
echo    - [PREVIEW] Attempting to add
echo    - [OVERLAY] Calling overlay_manager.show_text
echo    - [OVERLAY] Overlay window created successfully
echo.
echo If you don't see these messages, the app is still running old code.
echo.
pause
