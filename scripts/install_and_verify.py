#!/usr/bin/env python
"""Install and verify all required packages"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and show output"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Error: {e}")
        return False

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    try:
        __import__(import_name)
        print(f"✓ {package_name}")
        return True
    except ImportError:
        print(f"✗ {package_name} - NOT INSTALLED")
        return False

# Get venv Python path
venv_python = os.path.join(".venv311", "Scripts", "python.exe")
if not os.path.exists(venv_python):
    print("ERROR: Virtual environment not found at .venv311")
    print("Please create it first: py -3.11 -m venv .venv311")
    sys.exit(1)

print("Using Python:", venv_python)
print("Python version:")
run_command(f'"{venv_python}" --version', "Checking Python version")

# Upgrade pip
print("\n" + "="*60)
print("Upgrading pip...")
print("="*60)
run_command(f'"{venv_python}" -m pip install --upgrade pip', "Upgrading pip")

# Install requirements
print("\n" + "="*60)
print("Installing requirements from requirements.txt...")
print("This may take 10-30 minutes...")
print("="*60)
success = run_command(f'"{venv_python}" -m pip install -r requirements.txt', "Installing requirements")

if not success:
    print("\n⚠ Some packages may have failed to install")
    print("Continuing with verification...")

# Verify key packages
print("\n" + "="*60)
print("Verifying Installation")
print("="*60)

packages_to_check = [
    ("numpy", "numpy"),
    ("scipy", "scipy"),
    ("torch", "torch"),
    ("whisper", "whisper"),
    ("PyQt6", "PyQt6"),
    ("pyttsx3", "pyttsx3"),
    ("gtts", "gtts"),
    ("sounddevice", "sounddevice"),
    ("psutil", "psutil"),
    ("cryptography", "cryptography"),
    ("transformers", "transformers"),
    ("easynmt", "easynmt"),
]

all_ok = True
for package_name, import_name in packages_to_check:
    # Check using the venv Python
    result = subprocess.run(
        f'"{venv_python}" -c "import {import_name}; print(\'OK\')"',
        shell=True,
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        print(f"✓ {package_name}")
    else:
        print(f"✗ {package_name} - NOT INSTALLED")
        all_ok = False

print("\n" + "="*60)
if all_ok:
    print("✓ All packages verified!")
else:
    print("⚠ Some packages are missing. Try running the installation again.")
print("="*60)

print("\nYou can now run the app with:")
print(f'  "{venv_python}" src/main.py')
print("\nOr activate the venv and run:")
print("  .venv311\\Scripts\\activate")
print("  python src/main.py")
