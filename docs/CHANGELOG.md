# Changelog

All notable changes to Real-Time Game Voice Translation will be documented in this file.

## [1.0.0] - 2024-12-XX

### Commercial Release

#### Added

- **About Dialog**: Application information and version display
- **Version Display**: Version number shown in title bar and About dialog
- **Executable Packaging**: Windows executable build system (PyInstaller)
- **Installer**: Professional Inno Setup installer
- **Documentation**: Comprehensive user documentation
  - Installation Guide
  - License Activation Guide
  - Updated README for commercial release

#### Features

- Real-time audio capture from system/game audio
- OpenAI Whisper speech recognition with automatic language detection
- Google Translate API integration for live translation
- On-screen subtitle overlay with customizable positioning and size
- Text-to-speech playback (optional)
- Support for 15+ languages (English, Russian, Spanish, German, French, Portuguese, Polish, Turkish, Chinese, Japanese, Korean, Ukrainian, Italian, Arabic, Hindi) - optimized for gaming playerbase
- Multiple audio capture methods (VB-Audio Virtual Cable, Stereo Mix, WASAPI)
- Auto-configuration wizard for first-time setup
- Modern, intuitive user interface
- Comprehensive activity logging

#### Technical

- Built with Python 3.10+
- Tkinter GUI framework
- PyInstaller for executable packaging

#### Documentation

- Installation Guide (INSTALLATION.md)
- Audio Setup Guide (VB_AUDIO_SETUP_GUIDE.md)
- Troubleshooting Guide (SOLUTIONS.md)
- Quick Start Guide (QUICKSTART.md)

#### Distribution

- Windows executable (.exe)
- Inno Setup installer
- Portable ZIP version
- Available on itch.io (DRM protection handled by platform)

---

## Previous Versions

### Free Version (Pre-1.0.0)

- Initial development version
- Free, open-source release
- Basic functionality without license system
- Available as source code only
