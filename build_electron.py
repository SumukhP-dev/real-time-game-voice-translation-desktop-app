#!/usr/bin/env python3
"""
Build script for CSGO2 Voice Translation - Electron Edition
Creates distributable packages for the Electron application (Windows, macOS, Linux).
"""

import argparse
import sys
import os
import subprocess
import shutil
from pathlib import Path
from typing import List, Optional

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
ELECTRON_DIR = PROJECT_ROOT / "electron-app"
REACT_DIR = PROJECT_ROOT / "electron-app/react-frontend"
ML_SERVICE_DIR = PROJECT_ROOT / "fastapi-backend"


def ml_service_binary_name() -> str:
    return "ml-service.exe" if sys.platform == "win32" else "ml-service"


def ml_service_bundle_dir() -> Path:
    return ML_SERVICE_DIR / "dist" / "ml-service"


def ml_service_binary_path() -> Path:
    return ml_service_bundle_dir() / ml_service_binary_name()


def resolve_npm() -> Optional[str]:
    npm = shutil.which("npm")
    if npm:
        return npm
    if sys.platform == "win32":
        for candidate in (
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files (x86)\nodejs\npm.cmd",
        ):
            if os.path.exists(candidate):
                return candidate
    return None


def npm_cmd(*args: str) -> List[str]:
    return [resolve_npm() or "npm", *args]


def check_build_dependencies():
    """Check if build dependencies are available"""
    print("[CHECK] Verifying build dependencies...")

    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("[ERROR] Node.js not found")
            return False
        print(f"[CHECK] Node.js: {result.stdout.strip()}")
    except FileNotFoundError:
        print("[ERROR] Node.js not found")
        return False

    npm = resolve_npm()
    if not npm:
        print("[ERROR] npm not found")
        return False
    try:
        result = subprocess.run([npm, "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            print("[ERROR] npm not found")
            return False
        print(f"[CHECK] npm: {result.stdout.strip()} ({npm})")
    except FileNotFoundError:
        print("[ERROR] npm not found")
        return False

    return True


def build_ml_service():
    """Bundle FastAPI backend as ml-service for electron-builder extraResources."""
    print("[BUILD] Bundling ML service (PyInstaller)...")

    try:
        import PyInstaller  # noqa: F401
    except ImportError:
        print("[BUILD] Installing PyInstaller...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "pyinstaller>=6.0.0"],
            check=False,
        )
        if result.returncode != 0:
            print("[ERROR] Failed to install PyInstaller")
            return False

    os.chdir(ML_SERVICE_DIR)
    spec_path = ML_SERVICE_DIR / "ml-service.spec"
    if not spec_path.exists():
        print(f"[ERROR] Missing {spec_path}")
        return False

    result = subprocess.run(
        [sys.executable, "-m", "PyInstaller", str(spec_path), "--clean", "--noconfirm"],
        check=False,
    )
    if result.returncode != 0:
        print("[ERROR] PyInstaller failed for ML service")
        return False

    exe_path = ml_service_binary_path()
    if not exe_path.exists():
        print(f"[ERROR] Expected executable not found: {exe_path}")
        return False

    folder_mb = sum(
        f.stat().st_size for f in ml_service_bundle_dir().rglob("*") if f.is_file()
    ) / (1024 * 1024)
    print(f"[BUILD] ML service bundle ready ({folder_mb:.1f} MB): {exe_path}")
    return True


def build_react_app():
    """Build the React application"""
    print("[BUILD] Building React application...")

    os.chdir(REACT_DIR)

    if not (REACT_DIR / "node_modules").exists():
        print("[BUILD] Installing Node.js dependencies...")
        result = subprocess.run(npm_cmd("install"))
        if result.returncode != 0:
            print("[ERROR] npm install failed")
            return False

    print("[BUILD] Building React application...")
    result = subprocess.run(npm_cmd("run", "build"))
    if result.returncode != 0:
        print("[ERROR] React build failed")
        return False

    print("[BUILD] React application built successfully")
    return True


def build_electron_app(target_platform: Optional[str] = None):
    """Build the Electron application for the current or requested platform."""
    print("[BUILD] Building Electron application...")

    os.chdir(ELECTRON_DIR)

    if not (ELECTRON_DIR / "node_modules").exists():
        print("[BUILD] Installing Electron dependencies...")
        result = subprocess.run(npm_cmd("install"))
        if result.returncode != 0:
            print("[ERROR] npm install failed")
            return False

    env = os.environ.copy()
    env["CSC_IDENTITY_AUTO_DISCOVERY"] = "false"

    npm_script = "dist"
    if target_platform == "mac":
        npm_script = "dist:mac"
    elif target_platform == "win":
        npm_script = "dist:win"
    elif target_platform == "linux":
        npm_script = "dist:linux"

    print(f"[BUILD] Running npm run {npm_script} ...")
    result = subprocess.run(npm_cmd("run", npm_script), env=env)
    if result.returncode != 0:
        print("[ERROR] Electron build failed")
        return False

    print("[BUILD] Electron application built successfully")
    return True


def create_installer():
    """Copy build artifacts to ./dist at repo root."""
    print("[INSTALLER] Creating installer packages...")

    dist_dir = ELECTRON_DIR / "dist"

    if not dist_dir.exists():
        print("[ERROR] Build artifacts not found")
        return False

    final_dist_dir = PROJECT_ROOT / "dist"
    final_dist_dir.mkdir(exist_ok=True)

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
    parser = argparse.ArgumentParser(description="Build SquadSpeak Electron distributables")
    parser.add_argument(
        "--platform",
        choices=["win", "mac", "linux"],
        default=None,
        help="Target platform (default: current OS). Cross-compiling macOS DMG requires building on macOS.",
    )
    args = parser.parse_args()

    target = args.platform
    if target is None:
        if sys.platform == "darwin":
            target = "mac"
        elif sys.platform == "win32":
            target = "win"
        else:
            target = "linux"

    print("=" * 60)
    print("CSGO2 Voice Translation - Electron Edition")
    print("Build Script")
    print(f"Host: {sys.platform}  Target: {target}")
    print("=" * 60)

    if target == "mac" and sys.platform != "darwin":
        print(
            "[ERROR] macOS DMG builds must run on macOS (Intel or Apple Silicon)."
        )
        print("  On a Mac, from the repo root:")
        print("    python3 build_electron.py --platform mac")
        print("  Or: ./scripts/build-macos.sh")
        sys.exit(1)

    if not check_build_dependencies():
        print("[ERROR] Build dependency check failed")
        sys.exit(1)

    if not build_ml_service():
        print("[ERROR] Failed to bundle ML service")
        sys.exit(1)

    if not build_react_app():
        print("[ERROR] Failed to build React application")
        sys.exit(1)

    if not build_electron_app(target):
        print("[ERROR] Failed to build Electron application")
        sys.exit(1)

    if not create_installer():
        print("[ERROR] Failed to create installer packages")
        sys.exit(1)

    print("=" * 60)
    print("BUILD SUCCESSFUL!")
    print("Distribution packages are available in ./dist/")
    print("=" * 60)


if __name__ == "__main__":
    main()
