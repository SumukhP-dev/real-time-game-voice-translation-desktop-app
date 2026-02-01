"""
Build script for Real-Time Game Voice Translation
Creates Windows executable using PyInstaller
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path

def clean_build_dirs():
    """Clean previous build directories"""
    dirs_to_clean = ['build', 'dist']
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            print(f"Cleaning {dir_name}...")
            try:
                shutil.rmtree(dir_name)
            except PermissionError:
                print(f"  Warning: Could not delete {dir_name} (may be in use)")
    
    # Clean .spec file artifacts
    for spec_file in Path('.').glob('*.spec'):
        if spec_file.name != 'build.spec':
            print(f"Removing old spec file: {spec_file}")
            try:
                spec_file.unlink()
            except PermissionError:
                print(f"  Warning: Could not delete {spec_file}")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import PyInstaller
        print("✓ PyInstaller found")
    except ImportError:
        print("✗ PyInstaller not found. Installing...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyinstaller>=6.0.0'])
    
    # Check other critical dependencies
    required = ['tkinter', 'whisper', 'cryptography']
    optional = ['googletrans', 'deep_translator', 'EasyNMT', 'transformers', 'torch']
    missing = []
    for dep in required:
        try:
            __import__(dep)
            print(f"✓ {dep} found")
        except ImportError:
            missing.append(dep)
            print(f"✗ {dep} not found")
    
    # Check optional dependencies (warn but don't fail)
    for dep in optional:
        try:
            __import__(dep)
            print(f"✓ {dep} found (optional)")
        except ImportError:
            print(f"⚠ {dep} not found (optional, may limit features)")
    
    if missing:
        print(f"\nMissing required dependencies: {', '.join(missing)}")
        print("Please install them with: pip install -r requirements.txt")
        return False
    return True

def build_executable():
    """Build the executable using PyInstaller"""
    print("\n" + "="*60)
    print("Building Real-Time Game Voice Translation")
    print("="*60 + "\n")
    
    # Clean previous builds
    clean_build_dirs()
    
    # Check dependencies
    if not check_dependencies():
        print("\n✗ Build failed: Missing dependencies")
        return False
    
    # Run PyInstaller
    print("\nRunning PyInstaller...")
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'PyInstaller', 'build.spec', '--clean', '--noconfirm'],
            check=True,
            capture_output=True,
            text=True,
            env=env
        )
        print("✓ PyInstaller completed successfully")
        
        # Check if executable was created
        exe_path = Path('dist') / 'GameVoiceTranslator.exe'
        if exe_path.exists():
            size_mb = exe_path.stat().st_size / (1024 * 1024)
            print(f"\n✓ Executable created: {exe_path}")
            print(f"  Size: {size_mb:.2f} MB")
            return True
        else:
            print("\n✗ Executable not found in dist/")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"\n✗ PyInstaller failed:")
        print(e.stdout)
        print(e.stderr)
        return False

def create_distribution_package():
    """Create distribution package with necessary files"""
    print("\nCreating distribution package...")
    
    dist_dir = Path('dist')
    package_dir = dist_dir / 'GameVoiceTranslator_Package'
    package_dir.mkdir(exist_ok=True)
    
    # Copy executable
    exe_path = dist_dir / 'GameVoiceTranslator.exe'
    if exe_path.exists():
        shutil.copy2(exe_path, package_dir / exe_path.name)
        print(f"✓ Copied executable")
    
    # Copy README if exists
    if Path('README.md').exists():
        shutil.copy2('README.md', package_dir / 'README.txt')
        print("✓ Copied README")
    
    print(f"\n✓ Distribution package created in: {package_dir}")
    return True

def main():
    """Main build process"""
    print("Real-Time Game Voice Translation - Build Script")
    print("="*60)
    
    if not build_executable():
        print("\n✗ Build failed!")
        return 1
    
    if not create_distribution_package():
        print("\n✗ Package creation failed!")
        return 1
    
    print("\n" + "="*60)
    print("✓ Build completed successfully!")
    print("="*60)
    print("\nNext steps:")
    print("1. Test the executable in dist/GameVoiceTranslator_Package/")
    print("2. Create installer using installer.iss (Inno Setup)")
    print("3. Upload to itch.io")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

