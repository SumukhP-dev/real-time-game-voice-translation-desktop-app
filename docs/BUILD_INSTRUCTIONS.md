# Build Instructions

## Building the Executable

Build the executable using PyInstaller:

```bash
python build.py
```

This will create an executable ready for distribution on itch.io (which handles DRM protection).

## Building the Installer

After building the executable, create the installer:

1. Install **Inno Setup** from https://jrsoftware.org/isinfo.php
2. Open `installer.iss` in Inno Setup
3. Click "Build" → "Compile"
4. The installer will be created in `dist/` folder

## Distribution

### For itch.io:
- Upload the installer or portable ZIP
- itch.io's download protection handles access control
- No license activation required

