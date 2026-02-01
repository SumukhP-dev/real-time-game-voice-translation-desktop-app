#!/usr/bin/env python3
"""
CS:GO 2 Live Voice Translation Mod - Main Entry Point
Real-time voice translation for competitive multiplayer games

Usage:
    python main.py                    # Start the Electron application
    python main.py --help           # Show help
    python main.py --version        # Show version
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

VERSION = "1.0.0"

def start_electron_app():
    """Start the Electron application"""
    print("[MAIN] Starting Electron application...")
    
    # Check if Electron directory exists
    electron_dir = Path(__file__).parent / "electron-app"
    if not electron_dir.exists():
        print("[ERROR] Electron application directory not found")
        return False
    
    # Use the unified startup script
    startup_script = Path(__file__).parent / "start_electron.py"
    if startup_script.exists():
        print("[MAIN] Using unified startup script...")
        result = subprocess.run([sys.executable, str(startup_script)])
        return result.returncode == 0
    else:
        print("[ERROR] Unified startup script not found")
        return False

def main():
    """Main entry point for the application"""
    parser = argparse.ArgumentParser(
        description="CS:GO 2 Live Voice Translation Mod - Real-time voice translation"
    )
    parser.add_argument('--version', action='version', version=f'CSGO2 Voice Translator v{VERSION}')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("CSGO2 Voice Translation Mod")
    print(f"Version: {VERSION}")
    print("=" * 60)
    
    try:
        # Start Electron application
        success = start_electron_app()
        
        if not success:
            print("[ERROR] Application failed to start")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n[INTERRUPTED] Received interrupt signal")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
