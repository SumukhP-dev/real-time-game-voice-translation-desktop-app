#!/usr/bin/env python3
"""
Build script for CSGO2 Voice Translation - Electron Edition
Creates distributable packages for the Electron application
"""

import sys
import os
import subprocess
import shutil
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
ELECTRON_DIR = PROJECT_ROOT / "electron-app"
REACT_DIR = PROJECT_ROOT / "electron-app/react-frontend"
ML_SERVICE_DIR = PROJECT_ROOT / "fastapi-backend"

def check_build_dependencies():
    """Check if build dependencies are available"""
    print("[CHECK] Verifying build dependencies...")
    
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
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("[ERROR] npm not found")
            return False
        print(f"[CHECK] npm: {result.stdout.strip()}")
    except FileNotFoundError:
        print("[ERROR] npm not found")
        return False
    
    return True

def prepare_ml_service():
    """Prepare ML service for bundling"""
    print("[PREP] Preparing ML service...")
    
    # Change to ML service directory
    os.chdir(ML_SERVICE_DIR)
    
    # Install Python dependencies
    print("[PREP] Installing Python dependencies...")
    result = subprocess.run([
        sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt', 
        '--target', 'python_deps'
    ])
    if result.returncode != 0:
        print("[ERROR] Failed to install Python dependencies")
        return False
    
    # Create startup script for bundled version
    startup_script = ML_SERVICE_DIR / "start_bundled.py"
    with open(startup_script, 'w') as f:
        f.write('''#!/usr/bin/env python3
"""
Bundled ML service startup script
"""
import sys
import os
from pathlib import Path

# Add bundled dependencies to path
current_dir = Path(__file__).parent
deps_dir = current_dir / "python_deps"
if deps_dir.exists():
    sys.path.insert(0, str(deps_dir))

# Start the service
if __name__ == "__main__":
    import uvicorn
    from main import app
    uvicorn.run(app, host="127.0.0.1", port=8000)
''')
    
    print("[PREP] ML service prepared")
    return True

def build_react_app():
    """Build the React application"""
    print("[BUILD] Building React application...")
    
    # Change to React directory
    os.chdir(REACT_DIR)
    
    # Install Node.js dependencies
    if not (REACT_DIR / "node_modules").exists():
        print("[BUILD] Installing Node.js dependencies...")
        result = subprocess.run(['npm', 'install'])
        if result.returncode != 0:
            print("[ERROR] npm install failed")
            return False
    
    # Build the React app
    print("[BUILD] Building React application...")
    result = subprocess.run(['npm', 'run', 'build'])
    if result.returncode != 0:
        print("[ERROR] React build failed")
        return False
    
    print("[BUILD] React application built successfully")
    return True

def build_electron_app():
    """Build the Electron application"""
    print("[BUILD] Building Electron application...")
    
    # Change to Electron directory
    os.chdir(ELECTRON_DIR)
    
    # Install Node.js dependencies
    if not (ELECTRON_DIR / "node_modules").exists():
        print("[BUILD] Installing Electron dependencies...")
        result = subprocess.run(['npm', 'install'])
        if result.returncode != 0:
            print("[ERROR] npm install failed")
            return False
    
    # Build the Electron app
    print("[BUILD] Building Electron application...")
    result = subprocess.run(['npm', 'run', 'dist'])
    if result.returncode != 0:
        print("[ERROR] Electron build failed")
        return False
    
    print("[BUILD] Electron application built successfully")
    return True

def create_installer():
    """Create installer packages"""
    print("[INSTALLER] Creating installer packages...")
    
    # Find built executables
    dist_dir = ELECTRON_DIR / "dist"
    
    if not dist_dir.exists():
        print("[ERROR] Build artifacts not found")
        return False
    
    # Create distribution directory
    final_dist_dir = PROJECT_ROOT / "dist"
    final_dist_dir.mkdir(exist_ok=True)
    
    # Copy all bundles to distribution directory
    for item in dist_dir.glob("*"):
        if item.is_file() or item.is_dir():
            target = final_dist_dir / item.name
            if target.exists():
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink()
            
            if item.is_dir():
                shutil.copytree(item, target)
            else:
                shutil.copy2(item, target)
            print(f"[INSTALLER] Copied {item.name} to distribution")
    
    print("[INSTALLER] Installer packages created")
    return True

def main():
    """Main build process"""
    print("=" * 60)
    print("CSGO2 Voice Translation - Electron Edition")
    print("Build Script")
    print("=" * 60)
    
    # Check dependencies
    if not check_build_dependencies():
        print("[ERROR] Build dependency check failed")
        sys.exit(1)
    
    # Prepare ML service
    if not prepare_ml_service():
        print("[ERROR] Failed to prepare ML service")
        sys.exit(1)
    
    # Build React application
    if not build_react_app():
        print("[ERROR] Failed to build React application")
        sys.exit(1)
    
    # Build Electron application
    if not build_electron_app():
        print("[ERROR] Failed to build Electron application")
        sys.exit(1)
    
    # Create installer packages
    if not create_installer():
        print("[ERROR] Failed to create installer packages")
        sys.exit(1)
    
    print("=" * 60)
    print("BUILD SUCCESSFUL!")
    print("Distribution packages are available in ./dist/")
    print("=" * 60)

if __name__ == "__main__":
    main()
