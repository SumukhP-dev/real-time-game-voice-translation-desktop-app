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
_log_file = None

def _log(msg):
    """Print and append to startup log file for debugging."""
    print(msg)
    global _log_file
    if _log_file is None:
        try:
            _log_file = open(PROJECT_ROOT / "startup_log.txt", "w", encoding="utf-8")
        except Exception:
            return
    try:
        _log_file.write(msg + "\n")
        _log_file.flush()
    except Exception:
        pass

def cleanup_processes():
    """Clean up background processes on exit"""
    _log("[CLEANUP] Terminating background processes...")
    # Use module-level variables instead of startup_script attributes
    global react_process, electron_process
    if "react_process" in globals() and react_process:
        try:
            react_process.terminate()
            react_process.wait(timeout=5)
        except Exception:
            pass
    if "electron_process" in globals() and electron_process:
        try:
            electron_process.terminate()
            electron_process.wait(timeout=5)
        except Exception:
            pass

def check_dependencies():

    """Check if required dependencies are available"""
    _log("[CHECK] Verifying dependencies...")

    # Check Python
    if sys.version_info < (3, 8):
        _log("[ERROR] Python 3.8+ required")
        return False

    # Check Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            _log("[ERROR] Node.js not found")
            return False
        _log(f"[CHECK] Node.js: {result.stdout.strip()}")
    except FileNotFoundError:
        _log("[ERROR] Node.js not found")
        return False

    # Check npm
    try:
        # Try npm with full path or just check if it exists
        result = subprocess.run(['where', 'npm'], capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            # Try without where command
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True, shell=True)
            if result.returncode != 0:
                _log("[ERROR] npm not found")
                return False
        _log(f"[CHECK] npm: {result.stdout.strip() if result.stdout else 'Available'}")
    except (FileNotFoundError, Exception) as e:
        _log(f"[ERROR] npm not found: {e}")
        return False

    # Check Electron dependencies
    if not (ELECTRON_DIR / "node_modules").exists():
        _log("[ERROR] Electron dependencies not installed")
        _log("[INFO] Run: cd electron-app && npm install")
        return False

    # Check Python ML dependencies
    try:
        import fastapi
        import uvicorn
        _log("[CHECK] Python ML dependencies: OK")
    except ImportError as e:
        _log(f"[ERROR] Missing Python dependency: {e}")
        _log("[ERROR] Please install: pip install -r fastapi-backend/requirements.txt")
        return False

    return True

def get_npm_path():
    """Get the full path to npm executable"""
    try:
        result = subprocess.run(['cmd', '/c', 'where npm'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            # Get all lines and find the first .cmd file
            lines = result.stdout.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line and line.endswith('.cmd') and os.path.exists(line):
                    return line
            # If no .cmd found, use the first valid path
            for line in lines:
                line = line.strip()
                if line and os.path.exists(line):
                    return line
    except:
        pass
    
    # Fallback to common locations - look for .cmd files on Windows
    common_paths = [
        r'C:\Program Files\nodejs\npm.cmd',
        r'C:\Program Files (x86)\nodejs\npm.cmd'
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    # Try using 'npm' directly as last resort
    return 'npm'

def start_react_dev():

    """Start React development server"""
    _log("[REACT] Starting React development server...")

    # Change to React directory
    os.chdir(REACT_DIR)

    # Get npm path
    npm_path = get_npm_path()
    _log(f"[REACT] Using npm: {npm_path}")

    # Start React dev server
    global react_process
    react_process = subprocess.Popen([
        npm_path, 'run', 'dev'
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    _log(f"[REACT] React dev server started with PID: {react_process.pid}")

    # Wait for React server to be ready (Vite may use 3010, 3011, ... if ports are in use)
    _log("[REACT] Waiting for React server to be ready...")
    for i in range(30):  # Wait up to 30 seconds
        try:
            import requests
            for port in range(3010, 3020):  # 3010-3019
                try:
                    response = requests.get(f'http://localhost:{port}', timeout=1)
                    if response.status_code == 200:
                        _log(f"[REACT] React server is ready on port {port}!")
                        return port
                except Exception:
                    continue
        except Exception:
            pass

        # Check if process is still running
        if react_process.poll() is not None:
            _log("[ERROR] React dev server process died")
            if react_process.stdout:
                try:
                    _log("[ERROR] Output: " + (react_process.stdout.read() or ""))
                except Exception:
                    pass
            return None

        time.sleep(1)
        _log(f"[REACT] Waiting... ({i+1}/30)")

    _log("[ERROR] React server failed to start within 30 seconds")
    return None

def start_electron_app(react_port=None):

    """Start the Electron application. react_port: port where React dev server is running (for loading the UI)."""
    _log("[ELECTRON] Starting Electron application...")

    # Change to Electron directory
    os.chdir(ELECTRON_DIR)

    # Get npm path
    npm_path = get_npm_path()
    _log(f"[ELECTRON] Using npm: {npm_path}")

    env = os.environ.copy()
    if react_port is not None:
        env["REACT_DEV_PORT"] = str(react_port)
        _log(f"[ELECTRON] Using React dev server on port {react_port}")

    # Start Electron (pass port so it loads the correct URL)
    global electron_process
    electron_process = subprocess.Popen(
        [npm_path, 'start'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env,
        cwd=ELECTRON_DIR
    )

    _log(f"[ELECTRON] Electron app started with PID: {electron_process.pid}")

    return True

def main():

    """Main entry point"""
    _log("=" * 60)
    _log("CSGO2 Voice Translation - Electron Edition")
    _log("Unified Startup Script")
    _log("=" * 60)

    # Register cleanup
    atexit.register(cleanup_processes)

    # Check dependencies
    if not check_dependencies():
        _log("[ERROR] Dependency check failed")
        sys.exit(1)

    try:
        # Start React dev server (returns port or None)
        react_port = start_react_dev()
        if react_port is None:
            _log("[ERROR] Failed to start React dev server")
            sys.exit(1)

        # Start Electron app (pass port so it loads the correct URL)
        success = start_electron_app(react_port)
        if not success:
            _log("[ERROR] Electron application failed")
            sys.exit(1)

        # Block until Electron exits (so atexit doesn't kill it)
        if electron_process:
            electron_process.wait()

    except KeyboardInterrupt:
        _log("\n[INTERRUPTED] Received interrupt signal")
    except Exception as e:
        _log(f"[ERROR] Unexpected error: {e}")
        sys.exit(1)
    finally:
        cleanup_processes()

    _log("[DONE] Application shutdown complete")

if __name__ == "__main__":
    main()
