# Terminal Debugging Guide

## Overview
This guide explains the terminal debugging features added to help identify and fix issues.

## What Was Added

### 1. Enhanced Error Logging
- All errors now print to terminal with `❌` prefix
- Full stack traces are shown for debugging
- Errors are logged both to GUI and terminal

### 2. Startup Messages
- Clear startup banner showing app version
- Step-by-step initialization messages
- Success indicators (✓) for each component

### 3. Runtime Debugging
- Audio capture status messages
- Speech recognition processing logs
- Duplicate transcription warnings
- Audio level monitoring

## Terminal Output Examples

### Normal Startup
```
============================================================
CS:GO 2 Live Voice Translation Mod (FREE VERSION)
============================================================
Starting application...
Initializing Tkinter window...
Creating TranslationApp...
Using FREE WASAPI loopback capture (no third-party software required)
✓ Application initialized successfully
Starting main loop...
============================================================
```

### Error Example
```
❌ Error starting translation: [error message]
Traceback (most recent call last):
  [full stack trace]
```

## Debugging Commands

### Test All Components
```bash
python debug_terminal.py
```

### Check Syntax
```bash
python -c "import main_tkinter_free; print('OK')"
```

### Run with Full Output
```bash
python main_tkinter_free.py
```

## Common Issues and Solutions

### 1. No Terminal Output
- **Cause**: App might be running but not printing
- **Solution**: Check if GUI window opened, errors go to terminal

### 2. Import Errors
- **Cause**: Missing dependencies
- **Solution**: Run `pip install -r requirements.txt`

### 3. Audio Device Errors
- **Cause**: No loopback device available
- **Solution**: Enable Stereo Mix in Windows Sound settings

### 4. Whisper Model Errors
- **Cause**: Model not downloaded or corrupted
- **Solution**: Whisper will auto-download on first use

## Log Levels

- **✓** = Success message
- **⚠** = Warning message
- **❌** = Error message
- **ℹ** = Info message
- **📢** = Audio capture message

## Viewing Terminal Output

1. **Windows**: Run from Command Prompt or PowerShell
2. **VS Code**: Use integrated terminal
3. **Cursor**: Terminal panel at bottom

## Next Steps

If you see errors in terminal:
1. Copy the full error message
2. Check the stack trace
3. Look for the component causing the issue
4. Refer to troubleshooting guides in README.md

