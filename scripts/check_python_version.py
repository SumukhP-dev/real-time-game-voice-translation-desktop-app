#!/usr/bin/env python
"""
Check Python version compatibility for TTS library
"""
import sys

def check_python_version():
    """Check if Python version is compatible with TTS"""
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    
    print(f"Current Python version: {version_str}")
    print(f"Python {version.major}.{version.minor} detected")
    
    if version.major == 3:
        if version.minor in [9, 10, 11]:
            print("✅ Python version is COMPATIBLE with TTS library")
            print("You can install TTS with: pip install TTS")
            return True
        elif version.minor >= 12:
            print("❌ Python version is TOO NEW for TTS library")
            print("TTS requires Python 3.9, 3.10, or 3.11")
            print("\nSolutions:")
            print("1. Install Python 3.11 from https://www.python.org/downloads/")
            print("2. Create a new virtual environment:")
            print("   py -3.11 -m venv .venv311")
            print("   .venv311\\Scripts\\activate")
            print("3. Then install TTS: pip install TTS")
            return False
        else:
            print("❌ Python version is TOO OLD for TTS library")
            print("TTS requires Python 3.9, 3.10, or 3.11")
            print("\nSolutions:")
            print("1. Upgrade to Python 3.9 or higher from https://www.python.org/downloads/")
            print("2. Create a new virtual environment with the new Python version")
            return False
    else:
        print("❌ Python 2.x is not supported")
        print("Please use Python 3.9, 3.10, or 3.11")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Python Version Compatibility Check for TTS Library")
    print("=" * 60)
    print()
    
    compatible = check_python_version()
    
    print()
    print("=" * 60)
    if compatible:
        print("✅ Your Python version is ready for TTS installation!")
    else:
        print("⚠️  Please use a compatible Python version to use voice cloning")
        print("Note: The app works fine without TTS - it uses pyttsx3 and gTTS")
    print("=" * 60)
