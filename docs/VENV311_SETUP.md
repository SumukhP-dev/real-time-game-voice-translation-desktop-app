# Python 3.11 Virtual Environment Setup

This guide explains how to set up and use the `.venv311` virtual environment with Python 3.11 for voice cloning support.

## Why Python 3.11?

The TTS (Coqui TTS) library for voice cloning requires Python 3.9, 3.10, or 3.11. If you're using Python 3.12 or higher, you need to create a separate virtual environment with Python 3.11.

## Quick Start

### Option 1: Use the Activation Script (Easiest)

**Windows (Command Prompt):**

```batch
activate_venv311.bat
```

**Windows (PowerShell):**

```powershell
.\activate_venv311.ps1
```

### Option 2: Manual Activation

**Windows (Command Prompt):**

```batch
.venv311\Scripts\activate.bat
```

**Windows (PowerShell):**

```powershell
.\.venv311\Scripts\Activate.ps1
```

## Creating the Virtual Environment

If the virtual environment doesn't exist yet, create it:

```batch
py -3.11 -m venv .venv311
```

Or use the activation script which will create it automatically if it doesn't exist.

## Verify Installation

Run the verification script:

```batch
verify_venv311.bat
```

This will:

- Check if `.venv311` exists
- Show the Python version
- Create it if missing

## Installing Dependencies

Once the virtual environment is activated, install all dependencies:

```batch
pip install -r requirements.txt
```

Or install specific packages:

```batch
pip install TTS torch torchaudio
```

## Using the Virtual Environment

1. **Activate** the environment:

   ```batch
   activate_venv311.bat
   ```

2. **Run your application**:

   ```batch
   python src\main.py
   ```

3. **Deactivate** when done:
   ```batch
   deactivate
   ```

## Troubleshooting

### "Python 3.11 not found"

If `py -3.11` doesn't work:

1. **Check available Python versions:**

   ```batch
   py --list
   ```

2. **Install Python 3.11:**

   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Or use the Windows Store version

3. **Use full path:**
   ```batch
   C:\Python311\python.exe -m venv .venv311
   ```

### "Virtual environment already exists"

If you need to recreate it:

```batch
py -3.11 -m venv .venv311 --clear
```

### "Activation script not found"

If PowerShell blocks the script:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again:

```powershell
.\activate_venv311.ps1
```

## File Structure

After setup, you should have:

```
.venv311/
├── Scripts/
│   ├── activate.bat
│   ├── Activate.ps1
│   ├── python.exe
│   └── pip.exe
├── Lib/
└── pyvenv.cfg
```

## Notes

- The `.venv311` folder is typically ignored by git (in `.gitignore`)
- Each virtual environment is independent - packages installed in one don't affect others
- You can have multiple virtual environments for different Python versions
- Always activate the virtual environment before running the application

## Next Steps

1. Activate the virtual environment
2. Install dependencies: `pip install -r requirements.txt`
3. Test voice cloning: Initialize it from the Integrations dialog
4. Run the application: `python src\main.py`
