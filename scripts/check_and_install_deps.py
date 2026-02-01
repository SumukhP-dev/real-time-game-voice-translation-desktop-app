"""Check and install missing dependencies"""
import subprocess
import sys

def check_and_install():
    missing = []
    
    # Check each dependency
    deps = {
        'sounddevice': 'sounddevice',
        'pyaudio': 'pyaudio', 
        'psutil': 'psutil'
    }
    
    for module_name, package_name in deps.items():
        try:
            __import__(module_name)
            print(f"✓ {module_name} is installed")
        except ImportError:
            print(f"✗ {module_name} is MISSING")
            missing.append(package_name)
    
    if missing:
        print(f"\nInstalling missing packages: {', '.join(missing)}")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
            print("\n✓ Installation complete!")
            
            # Verify
            print("\nVerifying installation...")
            for module_name in missing:
                try:
                    __import__(module_name)
                    print(f"✓ {module_name} now installed")
                except ImportError:
                    print(f"✗ {module_name} still missing - installation may have failed")
        except Exception as e:
            print(f"\n✗ Installation failed: {e}")
            return False
    else:
        print("\n✓ All dependencies are installed!")
    
    return len(missing) == 0

if __name__ == '__main__':
    success = check_and_install()
    sys.exit(0 if success else 1)
