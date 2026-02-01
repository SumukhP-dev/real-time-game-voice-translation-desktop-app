#!/usr/bin/env python3
"""
Unified startup script for CSGO2 Voice Translation - Electron Edition
Starts both the ML service and the Electron application
"""

import sys
import os
import subprocess
import time
import signal
import atexit
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
ELECTRON_DIR = PROJECT_ROOT / "electron-app"
REACT_DIR = PROJECT_ROOT / "electron-app/react-frontend"

# Global process variables
react_process = None
electron_process = None

def cleanup_processes():
    """Clean up background processes on exit"""
    print("[CLEANUP] Terminating background processes...")
    # Use module-level variables instead of startup_script attributes
    global react_process, electron_process
    if 'react_process' in globals() and react_process:
        react_process.terminate()
        react_process.wait()
    if 'electron_process' in globals() and electron_process:
        electron_process.terminate()
        electron_process.wait()

def check_dependencies():
    """Check if required dependencies are available"""
    print("[CHECK] Verifying dependencies...")
    
    # Check Python
    if sys.version_info < (3, 8):
        print("[ERROR] Python 3.8+ required")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("[ERROR] Node.js not found")
            return False
        print(f"[CHECK] Node.js: {result.stdout.strip()}")
    except FileNotFoundError:
        print("[ERROR] Node.js not found")
        return False
    
    # Check npm
    try:
        # Try npm with full path or just check if it exists
        result = subprocess.run(['where', 'npm'], capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            # Try without where command
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True, shell=True)
            if result.returncode != 0:
                print("[ERROR] npm not found")
                return False
        print(f"[CHECK] npm: {result.stdout.strip() if result.stdout else 'Available'}")
    except (FileNotFoundError, Exception) as e:
        print(f"[ERROR] npm not found: {e}")
        return False
    
    # Check Electron dependencies
    if not (ELECTRON_DIR / "node_modules").exists():
        print("[ERROR] Electron dependencies not installed")
        print("[INFO] Run: cd electron-app && npm install")
        return False
    
    # Check Python ML dependencies
    try:
        import fastapi
        import uvicorn
        print("[CHECK] Python ML dependencies: OK")
    except ImportError as e:
        print(f"[ERROR] Missing Python dependency: {e}")
        print("[ERROR] Please install: pip install -r tauri-app/ml-service/requirements.txt")
        return False
    
    return True

def start_react_dev():
    """Start React development server"""
    print("[REACT] Starting React development server...")
    
    # Change to React directory
    os.chdir(REACT_DIR)
    
    # Start React dev server
    global react_process
    react_process = subprocess.Popen([
        'npm', 'run', 'dev'
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    print(f"[REACT] React dev server started with PID: {react_process.pid}")
    
    # Wait for React server to be ready
    print("[REACT] Waiting for React server to be ready...")
    for i in range(30):  # Wait up to 30 seconds
        try:
            import requests
            response = requests.get('http://localhost:1420', timeout=1)
            if response.status_code == 200:
                print("[REACT] React server is ready!")
                return True
        except:
            pass
        
        # Check if process is still running
        if react_process.poll() is not None:
            print("[ERROR] React dev server process died")
            print("[ERROR] Output:", react_process.stdout.read() if react_process.stdout else "No output")
            return False
        
        time.sleep(1)
        print(f"[REACT] Waiting... ({i+1}/30)")
    
    print("[ERROR] React server failed to start within 30 seconds")
    return False

def start_electron_app():
    """Start the Electron application"""
    print("[ELECTRON] Starting Electron application...")
    
    # Change to Electron directory
    os.chdir(ELECTRON_DIR)
    
    # Start Electron
    global electron_process
    electron_process = subprocess.Popen([
        'npm', 'start'
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    print(f"[ELECTRON] Electron app started with PID: {electron_process.pid}")
    
    return True

def main():
    """Main entry point"""
    print("=" * 60)
    print("CSGO2 Voice Translation - Electron Edition")
    print("Unified Startup Script")
    print("=" * 60)
    
    # Register cleanup
    atexit.register(cleanup_processes)
    
    # Check dependencies
    if not check_dependencies():
        print("[ERROR] Dependency check failed")
        sys.exit(1)
    
    try:
        # Start React dev server
        if not start_react_dev():
            print("[ERROR] Failed to start React dev server")
            sys.exit(1)
        
        # Start Electron app (this will block)
        success = start_electron_app()
        if not success:
            print("[ERROR] Electron application failed")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n[INTERRUPTED] Received interrupt signal")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        sys.exit(1)
    finally:
        cleanup_processes()
    
    print("[DONE] Application shutdown complete")

if __name__ == "__main__":
    main()
