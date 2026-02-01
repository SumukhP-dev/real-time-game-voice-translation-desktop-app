# Project Structure

This document outlines the organized structure of the CS:GO 2 Live Voice Translation Mod project.

## Directory Structure

```
CSGO2_Live_Voice_Translation_Mod/
├── main.py                           # Main application entry point
├── requirements.txt                  # Python dependencies
├── README.md                         # Project documentation
├── config.json                       # Configuration file (generated)
├── LICENSE                           # License file
├── EULA.txt                          # End User License Agreement
├── app_icon.ico                      # Application icon
├── app_icon.png                      # Application icon (PNG)
├── blue_microphone.png               # UI asset
├── build.spec                        # PyInstaller build configuration
├── installer.iss                     # Inno Setup installer script
│
├── src/                              # Source code directory
│   ├── __init__.py
│   ├── audio/                        # Audio capture modules
│   │   ├── audio_capture.py
│   │   ├── audio_capture_multi.py
│   │   ├── audio_capture_sounddevice.py
│   │   ├── audio_capture_wasapi.py
│   │   └── audio_capture_wasapi_free.py
│   ├── core/                         # Core functionality
│   │   ├── __init__.py
│   │   ├── speech_recognition.py     # Speech-to-text
│   │   ├── translation.py            # Translation engine
│   │   └── tts.py                    # Text-to-speech
│   ├── gui/                          # GUI components
│   │   ├── __init__.py
│   │   ├── setup_wizard.py           # Main application GUI
│   │   └── license_dialog.py         # License dialog
│   └── utils/                        # Utilities and configuration
│       ├── __init__.py
│       ├── config.py                 # Configuration management
│       ├── utils.py                  # Utility functions
│       └── license.py                # License system
│
├── tests/                            # Test files
│   ├── __init__.py
│   ├── requirements.txt              # Test dependencies
│   └── test_*.py                     # Various test modules
│
├── scripts/                          # Utility and setup scripts
│   ├── *.bat                         # Windows batch files
│   ├── *.ps1                         # PowerShell scripts
│   ├── debug_*.py                    # Debug scripts
│   ├── test_*.py                     # Test scripts
│   └── various utility scripts
│
├── docs/                             # Documentation
│   ├── PROJECT_STRUCTURE.md          # This file
│   ├── *.md                          # Various documentation files
│   └── README.md                     # Main documentation
│
├── tauri-app/                        # Tauri frontend application
│   ├── src/                          # Frontend source code
│   ├── src-tauri/                    # Rust backend
│   ├── package.json                  # Node.js dependencies
│   └── various frontend files
│
├── models/                           # Model files (gitignored)
├── archive/                          # Archived files
├── assets/                           # Static assets
├── build/                            # Build artifacts (gitignored)
├── dist/                             # Distribution artifacts (gitignored)
├── installers/                       # Installer files
├── locales/                          # Localization files
└── tools/                            # Development tools
```

## Key Components

### Main Entry Point
- **`main.py`**: Primary application entry point with argument parsing and error handling

### Source Code (`src/`)
- **`audio/`**: Audio capture modules supporting different methods (WASAPI, PyAudio, sounddevice)
- **`core/`**: Core functionality including speech recognition, translation, and text-to-speech
- **`gui/`**: GUI components including the main application window and license dialog
- **`utils/`**: Utility functions, configuration management, and license system

### Testing (`tests/`)
- Comprehensive test suite for all major components
- Integration tests for the full application
- Device-specific tests

### Scripts (`scripts/`)
- Installation and setup scripts
- Debug and diagnostic tools
- Build and deployment utilities

### Documentation (`docs/`)
- Complete documentation including setup guides, troubleshooting, and API reference
- Project structure and development guidelines

### Frontend (`tauri-app/`)
- Modern web-based frontend using Tauri framework
- Rust backend for performance-critical operations
- Web-based overlay system

## Usage

### Running the Application
```bash
python main.py              # Start the GUI application
python main.py --debug      # Start in debug mode
python main.py --version    # Show version information
```

### Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest tests/

# Build application
pyinstaller build.spec
```

## Notes

- The `audio/` directory is excluded from git due to `.gitignore` rules (line 42)
- Model files, build artifacts, and large binary files are excluded from version control
- The project supports both Python backend (traditional) and Tauri frontend (modern)
- Configuration files are generated at runtime and should not be committed to version control
