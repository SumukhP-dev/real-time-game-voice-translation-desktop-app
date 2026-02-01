"""Check virtual environment and installed packages"""
import sys
import os
import subprocess

print("="*60)
print("Virtual Environment Diagnostic")
print("="*60)

# Check if venv exists
venv_path = os.path.join(".venv311", "Scripts", "python.exe")
print(f"\n1. Checking venv path: {venv_path}")
if os.path.exists(venv_path):
    print(f"   ✓ Virtual environment found")
else:
    print(f"   ✗ Virtual environment NOT found")
    print(f"   Please create it with: py -3.11 -m venv .venv311")
    sys.exit(1)

# Check Python version
print(f"\n2. Python version:")
try:
    result = subprocess.run([venv_path, "--version"], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(f"   {result.stdout.strip()}")
except Exception as e:
    print(f"   Error: {e}")

# Check pip
print(f"\n3. Pip version:")
try:
    result = subprocess.run([venv_path, "-m", "pip", "--version"], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(f"   {result.stdout.strip()}")
except Exception as e:
    print(f"   Error: {e}")

# List installed packages
print(f"\n4. Installed packages:")
try:
    result = subprocess.run([venv_path, "-m", "pip", "list"], capture_output=True, text=True, encoding='utf-8', errors='replace')
    lines = result.stdout.strip().split('\n')
    # Show first 20 packages
    for line in lines[:25]:
        print(f"   {line}")
    if len(lines) > 25:
        print(f"   ... and {len(lines) - 25} more packages")
except Exception as e:
    print(f"   Error: {e}")

# Check key packages
print(f"\n5. Key package verification:")
packages = [
    ("numpy", "numpy"),
    ("torch", "torch"),
    ("whisper", "whisper"),
    ("PyQt6", "PyQt6"),
    ("pyttsx3", "pyttsx3"),
    ("gtts", "gtts"),
    ("sounddevice", "sounddevice"),
    ("psutil", "psutil"),
    ("cryptography", "cryptography"),
]

for pkg_name, import_name in packages:
    try:
        result = subprocess.run(
            [venv_path, "-c", f"import {import_name}; print('OK')"],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=5
        )
        if result.returncode == 0:
            # Try to get version
            try:
                version_result = subprocess.run(
                    [venv_path, "-c", f"import {import_name}; print({import_name}.__version__)"],
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    errors='replace',
                    timeout=5
                )
                version = version_result.stdout.strip() if version_result.returncode == 0 else "OK"
                print(f"   ✓ {pkg_name}: {version}")
            except:
                print(f"   ✓ {pkg_name}: installed")
        else:
            print(f"   ✗ {pkg_name}: NOT installed")
    except Exception as e:
        print(f"   ✗ {pkg_name}: Error checking - {e}")

print("\n" + "="*60)
print("Diagnostic complete")
print("="*60)
